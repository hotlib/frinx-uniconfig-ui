const moment = require('moment');
const filter = require('lodash/fp/filter');
const forEach = require('lodash/fp/forEach');
const map = require('lodash/fp/map');
const transform = require('lodash/transform');
const identity = require('lodash/identity');

const Router = require('express');
const http = require('../server/HttpServerSide').HttpClient;

const router = new Router();
const baseURL = process.env.WF_SERVER;
const baseURLWorkflow = baseURL + 'workflow/';
const baseURLMeta = baseURL + 'metadata/';
const baseURLTask = baseURL + 'tasks/';

router.get('/metadata/taskdef', async (req, res, next) => {
    try {
        console.log(res);
        const result = await http.get(baseURLMeta + 'taskdefs', req.token);
        res.status(200).send({ result });
    } catch (err) {
        next(err);
    }
});

router.get('/metadata/workflow', async (req, res, next) => {
    try {
        const result = await http.get(baseURLMeta + 'workflow', req.token);
        res.status(200).send({ result });
    } catch (err) {
        next(err);
    }
});

router.get('/metadata/workflow/:name/:version', async (req, res, next) => {
    try {
        const result = await http.get(
            baseURLMeta + 'workflow/' + req.params.name + '?version=' + req.params.version,
            req.token
        );
        res.status(200).send({ result });
    } catch (err) {
        next(err);
    }
});

router.put('/metadata', async (req, res, next) => {
    try {
        const result = await http.put(baseURLMeta + 'workflow/', req.body);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.post('/workflow/:workflowName', async (req, res, next) => {
    try {
        const result = await http.post(baseURLWorkflow + req.params.workflowName, req.body);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.get('/executions', async (req, res, next) => {
    try {

        let freeText = [];
        if (req.query.freeText !== '') {
            freeText.push(req.query.freeText);
        } else {
            freeText.push('*');
        }

        let h = '-1';
        if (req.query.h !== 'undefined' && req.query.h !== '') {
            h = req.query.h;
        }
        if (h !== '-1') {
            freeText.push('startTime:[now-' + h + 'h TO now]');
        }
        let start = 0;
        if (!isNaN(req.query.start)) {
            start = req.query.start;
        }

        let query = req.query.q;

        //TODO query wfs in batch of 100 for better performance
        const url = baseURLWorkflow + 'search?size=1000&sort=startTime:DESC&freeText=' + encodeURIComponent(freeText.join(' AND ')) + '&start=' + start + '&query=' +
            encodeURIComponent(query);
        const result = await http.get(url, req.token);
        const hits = result.results;
        res.status(200).send({ result: { hits: hits, totalHits: result.totalHits } });
    } catch (err) {
        next(err);
    }
});

router.delete('/bulk/terminate', async (req, res, next) => {
    try {
        const result = await http.delete(baseURLWorkflow + "bulk/terminate", req.body, req.token);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.put('/bulk/pause', async (req, res, next) => {
    try {
        const result = await http.put(baseURLWorkflow + "bulk/pause", req.body, req.token);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.put('/bulk/resume', async (req, res, next) => {
    try {
        const result = await http.put(baseURLWorkflow + "bulk/resume", req.body, req.token);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.post('/bulk/retry', async (req, res, next) => {
    try {
        const result = await http.post(baseURLWorkflow + "bulk/retry", req.body, req.token);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.post('/bulk/restart', async (req, res, next) => {
    try {
        const result = await http.post(baseURLWorkflow + "bulk/restart", req.body, req.token);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.delete('/workflow/:workflowId', async (req, res, next) => {
    try {
        const result = await http.delete(baseURLWorkflow + req.params.workflowId + '/remove', req.body, req.token);
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.get('/id/:workflowId', async (req, res, next) => {
    try {
        const result = await http.get(baseURLWorkflow + req.params.workflowId + '?includeTasks=true', req.token);
        let meta = result.workflowDefinition;
        if (!meta) {
            meta = await http.get(
                baseURLMeta + 'workflow/' + result.workflowType + '?version=' + result.version,
                req.token
            );
        }

        const subs = filter(identity)(
            map(task => {
                if (task.taskType === 'SUB_WORKFLOW') {
                    const subWorkflowId = task.inputData && task.inputData.subWorkflowId;

                    if (subWorkflowId != null) {
                        return {
                            name: task.inputData.subWorkflowName,
                            version: task.inputData.subWorkflowVersion,
                            referenceTaskName: task.referenceTaskName,
                            subWorkflowId: subWorkflowId
                        };
                    }
                }
            })(result.tasks || [])
        );

        (result.tasks || []).forEach(task => {
            if (task.taskType === 'SUB_WORKFLOW') {
                const subWorkflowId = task.inputData && task.inputData.subWorkflowId;

                if (subWorkflowId != null) {
                    subs.push({
                        name: task.inputData.subWorkflowName,
                        version: task.inputData.subWorkflowVersion,
                        referenceTaskName: task.referenceTaskName,
                        subWorkflowId: subWorkflowId
                    });
                }
            }
        });

        const logs = map(task => Promise.all([task, http.get(baseURLTask + task.taskId + '/log')]))(result.tasks);
        const LOG_DATE_FORMAT = 'MM/DD/YY, HH:mm:ss:SSS';

        await Promise.all(logs).then(result => {
            forEach(([task, logs]) => {
                if (logs) {
                    task.logs = map(({ createdTime, log }) => `${moment(createdTime).format(LOG_DATE_FORMAT)} : ${log}`)(logs);
                }
            })(result);
        });

        const promises = map(({ name, version, subWorkflowId, referenceTaskName }) =>
            Promise.all([
                referenceTaskName,
                http.get(baseURLMeta + 'workflow/' + name + '?version=' + version),
                http.get(baseURLWorkflow + subWorkflowId + '?includeTasks=true')
            ])
        )(subs);

        const subworkflows = await Promise.all(promises).then(result => {
            return transform(
                result,
                (result, [key, meta, wfe]) => {
                    result[key] = { meta, wfe };
                },
                {}
            );
        });

        res.status(200).send({ result, meta, subworkflows: subworkflows });
    } catch (err) {
        next(err);
    }
});

router.get('/workflow/tasks', async (req, res, next) => {
    try {
        const result = await http.get(baseURLTask + 'search?size=1000' , req.token);
        res.status(200).send({result});
    } catch (err) {
        next(err);
    }
});


module.exports = router;
