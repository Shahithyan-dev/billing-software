const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/Shahithyan-dev/billing-software/actions/runs',
  method: 'GET',
  headers: {
    'User-Agent': 'node.js'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    const lastRun = runs[0];
    console.log('Run ID:', lastRun.id);
    
    https.get({
      hostname: 'api.github.com',
      path: `/repos/Shahithyan-dev/billing-software/actions/runs/${lastRun.id}/jobs`,
      headers: { 'User-Agent': 'node.js' }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        const jobs = JSON.parse(data2).jobs;
        console.log('Job ID:', jobs[0].id);
        
        https.get({
          hostname: 'api.github.com',
          path: `/repos/Shahithyan-dev/billing-software/actions/jobs/${jobs[0].id}/logs`,
          headers: { 'User-Agent': 'node.js' }
        }, (res3) => {
          let logData = '';
          if (res3.statusCode === 302) {
             const loc = res3.headers.location;
             https.get(loc, (res4) => {
                 let finalLog = '';
                 res4.on('data', c => finalLog += c);
                 res4.on('end', () => {
                    const lines = finalLog.split('\n');
                    console.log(lines.slice(-50).join('\n'));
                 });
             });
          }
        });
      });
    });
  });
});
