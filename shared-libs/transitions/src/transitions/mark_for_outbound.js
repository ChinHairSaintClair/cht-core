/**
 * Attempts to convert and send an outbound request, queuing it for later if needed.
 *
 * For historic reasons this is called *mark* for outbound (as opposed to send and then if that
 * fails mark for outbound, but transition names are part of our API so we can't change it easily.
 *
 */
const vm = require('vm');

const config = require('../config');
const db = require('../db');
const utils = require('../lib/utils');
const logger = require('@medic/logger');
const outbound = require('@medic/outbound');
const NAME = 'mark_for_outbound';
const CONFIGURED_PUSHES = 'outbound';
const TIME_FRAME_DURATION = 5 * 60 * 1000;
const infodocLib = require('@medic/infodoc');
infodocLib.initLib(db.medic, db.sentinel);

const relevantTo = (doc) => {
  const pushes = config.get(CONFIGURED_PUSHES) || {};

  return Object.keys(pushes)
    .filter(key => {
      const conf = pushes[key];
      return conf.relevant_to && vm.runInNewContext(conf.relevant_to, { doc });
    })
    .map(key => [pushes[key], key]);
};


const markForOutbound = (change) => {
  // We're working out the relevant tasks to perform here and not in the exported filter function,
  // because there is no way to communicate between the filter and onMatch functions, and so because
  // we *have* to do it here nothing of value is added to also perform it in filter
  const relevantConfigs = relevantTo(change.doc);

  let p = Promise.resolve();

  const failedKeys = [];

  for (const [config, configKey] of relevantConfigs) {
    if (config.cron && !utils.isWithinTimeFrame(config.cron, TIME_FRAME_DURATION)) {
      failedKeys.push(configKey);
      continue;
    }

    p = p.then(() => outbound.send(config, configKey, change.doc, change.info))
      .then(sent => {
        if (sent) {
          // Successfully sent, outbound.send wrote to the infodoc
          return infodocLib.saveCompletedTasks(change.info.doc_id, change.info, change.info.completed_tasks);
        }
      })
      .catch(() => {
        // First realtime attempt failed, queue for later
        failedKeys.push(configKey);
      });
  }

  return p.then(() => {
    if (!failedKeys.length) {
      return;
    }

    return db.sentinel.get(`task:outbound:${change.doc._id}`)
      .then(existingOutboundTask => {
        // TODO: deal with either ignoring or topping up existing queue
        logger.info(`${existingOutboundTask._id} already exists, ignoring`);
      })
      .catch(err => {
        if (err.status !== 404) {
          throw err;
        }

        const taskId = `task:outbound:${change.doc._id}`;

        logger.info(`Creating outbound task ${taskId}`);

        return db.sentinel.put({
          _id: taskId,
          type: 'task:outbound',
          created: Date.now(),
          doc_id: change.doc._id,
          queue: failedKeys
        });
      });
  }).then(() => false); // false because we didn't change the change.doc
};

module.exports = {
  name: NAME,
  filter: change => Object.keys(config.get(CONFIGURED_PUSHES) || {}).length > 0, // eslint-disable-line no-unused-vars
  onMatch: change => Promise.resolve().then(() => markForOutbound(change))
};
