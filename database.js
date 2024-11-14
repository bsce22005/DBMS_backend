// var mysql = require('mysql');

import mysql from 'mysql';

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});

export default con;