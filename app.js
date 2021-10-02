const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const app = express();
const https = require('https');
const http = require('http');
const data = require('./data/data.json');

// cors enable
app.use(cors());
app.options('*', cors());

//logging each request in server
app.use(morgan('tiny'));

// getting response body
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

// all records
app.get('/records', (req, res) => {
  return res.send(data);
});

// get page specific formatted data
// sample url : http://localhost:2400/api/managed-records?pageNo=1
app.get('/api/managed-records', async (req, res) => {
  let pageNo = req.query.pageNo
    ? req.query.pageNo > 0
      ? parseInt(req.query.pageNo)
      : 1
    : 1;
  const proxyHost = req.headers['x-forwarded-host'];
  const host = proxyHost ? proxyHost : req.headers.host;
  const fullUrl = req.protocol + '://' + host;

  req.protocol == 'https'
    ? https
    : http
        .get(`${fullUrl}/records`, async (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });
          resp.on('end', () => {
            let allData = JSON.parse(data);
            let partData = [];
            let totalPages = allData.length / 10;
            if (pageNo <= totalPages) {
              partData = allData.slice(pageNo * 10 - 10, pageNo * 10);
            }

            let ids = [],
              opens = [],
              closedCount = 0;
            let prevPage = 0;
            let nextPage = 0;
            if (pageNo == 1) {
              prevPage = null;
            } else if (pageNo < totalPages + 1) {
              prevPage = pageNo - 1;
            } else {
              prevPage = null;
            }

            if (pageNo < totalPages) {
              nextPage = pageNo + 1;
            } else {
              nextPage = null;
            }
            if (partData.length > 0) {
              partData.forEach((item) => {
                ids.push(item.id);
                if (item.disposition == 'open') {
                  opens.push(item);
                }
                if (
                  item.disposition == 'open' &&
                  (item.color == 'red' ||
                    item.color == 'blue' ||
                    item.color == 'yellow')
                ) {
                  closedCount++;
                }
              });
            }
            let obj = {
              ids: ids,
              open: opens,
              ClosedCount: closedCount,
              PreviousPage: prevPage,
              NextPage: nextPage,
            };
            return res.send(obj);
          });
        })
        .on('error', (err) => {
          console.log('Error: ' + err.message);
          return res.status(500).send('error while processing data');
        });
});

// get page specific formatted data
// sample url : http://localhost:2400/api/managed-records.js?pageNo=1
app.get('/api/managed-records.js', async (req, res) => {
  let pageNo = req.query.pageNo
    ? req.query.pageNo > 0
      ? parseInt(req.query.pageNo)
      : 1
    : 1;
  const proxyHost = req.headers['x-forwarded-host'];
  const host = proxyHost ? proxyHost : req.headers.host;
  const fullUrl = req.protocol + '://' + host;

  req.protocol == 'https'
    ? https
    : http
        .get(`${fullUrl}/records`, async (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });
          resp.on('end', () => {
            let allData = JSON.parse(data);
            let partData = [];
            let totalPages = allData.length / 10;
            if (pageNo <= totalPages) {
              partData = allData.slice(pageNo * 10 - 10, pageNo * 10);
            }

            let ids = [],
              opens = [],
              closedCount = 0;
            let prevPage = 0;
            let nextPage = 0;
            if (pageNo == 1) {
              prevPage = null;
            } else if (pageNo < totalPages + 1) {
              prevPage = pageNo - 1;
            } else {
              prevPage = null;
            }

            if (pageNo < totalPages) {
              nextPage = pageNo + 1;
            } else {
              nextPage = null;
            }
            if (partData.length > 0) {
              partData.forEach((item) => {
                ids.push(item.id);
                if (item.disposition == 'open') {
                  opens.push(item);
                }
                if (
                  item.disposition == 'open' &&
                  (item.color == 'red' ||
                    item.color == 'blue' ||
                    item.color == 'yellow')
                ) {
                  closedCount++;
                }
              });
            }
            let obj = {
              ids: ids,
              open: opens,
              ClosedCount: closedCount,
              PreviousPage: prevPage,
              NextPage: nextPage,
            };
            return res.send(obj);
          });
        })
        .on('error', (err) => {
          console.log('Error: ' + err.message);
          return res.status(500).send('error while processing data');
        });
});

app.listen(process.env.PORT || 2400, () => {
  console.log(`server started on port ${process.env.PORT || 2400}`);
});
