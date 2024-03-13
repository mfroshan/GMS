var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ssgarage"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
function jsonformating(data) {
  var rs1 = data.replace(/\\/g, "");
  var len = rs1.length;
  for (let i = 0; i < len; i++) {
    if (rs1[i] == "[" && rs1[i + 1] == "\"" && rs1[i + 2] == "{") {
      rs1 = rs1.substring(0, i+1) + rs1.substring(i + 2, len);
    }
    if (rs1[i] == "]" && rs1[i - 1] == "\"" && rs1[i - 2] == "}") {
      rs1 = rs1.substring(0, i - 2) + rs1.substring(i, len);
    }
    if (rs1[i] == "{" && rs1[i - 1] == "\"") {
      rs1 = rs1.substring(0, i - 1) + rs1.substring(i, len);
    }
    if (rs1[i] == "}" && rs1[i + 1] == "\"") {
      rs1 = rs1.substring(0, i + 1) + rs1.substring(i + 2, len);
    }
    if (rs1[i - 1] == "\"" && rs1[i] == "[") {
      rs1 = rs1.substring(0, i - 1) + rs1.substring(i, len);
    }
    if (rs1[i] == "]" && rs1[i + 1] == "\"") {
      rs1 = rs1.substring(0, i+1) + rs1.substring(i + 2, len);
    }
  }
  return rs1;
}
// function jsonformating(data) {
//   const regex = /\\|("(\[|\{)|(\]|\})"|\[(?=")|(?<=\])")/g;
//   return data.replace(regex, '');
// }

/* POST home page. */
router.post('/', function (req, res, next) {
  const data = req.body
  res.set({
    'Content-Type': 'JSON/application',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
  })
  if (data.type === "SP_CALL") {
    if (data.requestId === 1800001) {
      var uid = data.request.uId;
      var vid = data.request.vId;
      con.query("insert into complaintmaster(vId,userid) values(?,?)", [vid, uid], function (err, result, fields) {
        if (err) throw err;
        con.query("select MAX(cmpId) as id from complaintmaster", function (err, result, fields) {
          if (err) throw err;
          var cmpid = result[0].id;
          var complaints = data.request.complaints;
          var len = complaints.length;
          let errorMessage = null;
          for (let i = 0; i < len; i++) {
            con.query("insert into compdetailmaster(cmpId,complaint,problem,img) values(?,?,?,?)", [cmpid, complaints[i].complaint, complaints[i].problem, complaints[i].image], function (err, result, fields) {
              if (err) {
                errorMessage = err.message;
                return;
              }
            });
          }
          if (errorMessage) {
            throw errorMessage;
          } else {
            res.json({ errorCode: 1, result: "Complaint Added Successfully" });
          }
        }
        );
      });
    } else {
      //authentication(data.request)
      con.query("call `" + data.requestId + "`('" + JSON.stringify(data.request) + "')", function (err, result, fields) {
        if (err) throw err;
        //res.send(JSON.parse(jsonformating(result[0][0].result)));
        res.send(jsonformating(result[0][0].result));
        //res.send(result[0][0].result);
      });
    }
  }
  else if (data.type === "Authetication") {
    //get data from database
    con.query("call userLogin('" + JSON.stringify(data.request) + "')", function (err, result, fields) {
      if (err) throw err;
      res.send(JSON.parse(jsonformating(result[0][0].result)));
    });
  } 
  else {
    res.send("Wrong request")
  }

});

module.exports = router;
