// **** reference ****
//http://javatechnology.net/javascript/angularjs-controller-directive/
//http://qiita.com/higuma/items/b23ca9d96dac49999ab9
//http://astone.jeez.jp/angular_directive_template/
//http://www.dbonline.jp/sqlite/type/index1.html#section1
//http://keicode.com/script/html5-web-sql-database.php
//http://milkyshade.com/javascript/166/
//http://www.techscore.com/blog/2016/07/15/angularjs-1-5-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6-angular-2-%E3%81%B8%E3%81%AE%E7%A7%BB%E8%A1%8C%E3%82%92%E6%A5%BD%E3%81%AB%E3%81%97%E3%82%88%E3%81%86%EF%BC%81%EF%BC%81/
//http://kichipoyo.hatenablog.com/entry/2013/12/01/045519
//http://www.jiichan.com/programming/programming.php?lang=js&no=10
//http://www.jiichan.com/programming/programming.php?lang=js&no=10

"use strict";
(function() {
  // ==== initialize ====
  var app = angular.module('trainingApp', []);
  var dbName = 't-App';
  var version = '1.0';
  var displayName = 't-App';
  var estimatedSize = 65536;
  var t_list = ["Push_ups","Plank","Crunch","Side-Crunch","Running","Back_Extension"];
  var db = openDB();

  // ==== Web SQL ====
  function openDB(){
    return openDatabase(dbName, version, displayName, estimatedSize);
  }

  // ==== Using LocalStorage ====

  //Controllerの設定をしています。
  app.controller('appCtrl', function($scope) {
    $scope.active_tab = "home";
    $scope.setTab = function(active_tab){
      $scope.active_tab = active_tab;
    };
  });
  //Directiveの設定をしています。
  // app.directive('sampleDirective', function(){
  //   return {
  //     templateUrl: 'navbar.html'
  //   };
  // });

  app.controller('graphCtrl',function($scope){
    $scope.selectSql = function(sql_state,callback){
      var items = new Array();
      
      db.transaction(
        function(trans){
          trans.executeSql(
            sql_state,[],
              function(trans,r){
                // console.log(r.rows)
                // sql_result.t_data = r.rows;
                
                for(var i=0;i<r.rows.length;i++){
                  items.push(r.rows.item(i));
                }
                $scope.graph_data_list = items;
                console.log($scope.graph_data_list);
                callback();
              }
          )
        }
      )
      // 
    };
    $scope.showGraph = function(){
      var table_name = "t_data_table"
      var year = $scope.graph_date.getFullYear()
      var month = $scope.graph_date.getMonth()+1
      var sql_state = 'SELECT t_name,count,date FROM '+table_name+ ' WHERE year='+year+' AND month='+month+';'

      // Create label
      var label = []
      var push_ups=[]
      var crunch=[]
      for(var i=1;i<32;i++){
        label.push(year+" / "+month+" / "+i);
        push_ups.push(0);
        crunch.push(0);
      }

      //Create data
      console.log(label);
      $scope.selectSql(sql_state,function(){
        //Create data
        $.each($scope.graph_data_list,function(index,val){
          if(val.t_name=="Push_ups"){
            push_ups[val.date-1]=val.count;
          }else if(val.t_name=="Crunch"){
            crunch[val.date-1]=val.count;
          }
        })
        console.log($scope.graph_data_list);
        var ctx_push = document.getElementById("myPushChart").getContext("2d");
        var ctx_crunch = document.getElementById("myCrunchChart").getContext("2d");
        ctx_push.canvas.width = 600;
        ctx_push.canvas.height = 100;
        ctx_crunch.canvas.width = 600;
        ctx_crunch.canvas.height = 100; 

        // var type = "line"
        var type = "bar"
        var push_ups_data = {
            labels: label,
            datasets: [
                {
                    label: "Push_ups",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: push_ups,
                    spanGaps: false,
                }
            ]
        };
        var crunch_data = {
            labels: label,
            datasets: [
                {
                    label: "Crunch",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(255, 99, 132, 0.4)",
                    borderColor: "rgba(255,99,132,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(255,99,132,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(255, 99, 132, 0.4)",
                    pointHoverBorderColor: "rgba(255,99,132,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: crunch,
                    spanGaps: false,
                }
            ]
        };
        // var data = {
        //         labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        //         datasets: [{
        //             label: '# of Votes',
        //             data: [12, 19, 3, 5, 2, 3],
        //             backgroundColor: [
        //                 'rgba(255, 99, 132, 0.2)',
        //                 'rgba(54, 162, 235, 0.2)',
        //                 'rgba(255, 206, 86, 0.2)',
        //                 'rgba(75, 192, 192, 0.2)',
        //                 'rgba(153, 102, 255, 0.2)',
        //                 'rgba(255, 159, 64, 0.2)'
        //             ],
        //             borderColor: [
        //                 'rgba(255,99,132,1)',
        //                 'rgba(54, 162, 235, 1)',
        //                 'rgba(255, 206, 86, 1)',
        //                 'rgba(75, 192, 192, 1)',
        //                 'rgba(153, 102, 255, 1)',
        //                 'rgba(255, 159, 64, 1)'
        //             ],
        //             borderWidth: 1
        //         }]
        //     }
        var myPushChart = new Chart(ctx_push, {
            type: type,
            data: push_ups_data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
        var myCrunchChart = new Chart(ctx_crunch, {
            type: type,
            data: crunch_data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
      });
    }
  });

  app.controller('trainingCtrl',function($scope){
    $scope.t_list = t_list;
    $scope.selected_t = $scope.t_list[0];
    console.log($scope.t_list);
    $scope.showData = function(){
      if($scope.dateobj){
        var date = $scope.dateobj;
        $scope.year  = date.getFullYear();
        $scope.month = date.getMonth()+1;
        $scope.date  = date.getDate();
        $scope.now_date = date.toDateString().replace(/ /g,"_");
      }
      $scope.selectData();
    }
    $scope.selectData = function(){
      var t = $scope.selected_t;
      var date = $scope.date;
      var year = $scope.year;
      var month = $scope.month;
      console.log(date)
      console.log(t)
      var table_name = "t_data_table"
      var items = new Array();
      
      db.transaction(
        function(trans){
          trans.executeSql(
            'SELECT t_name,count FROM '+table_name+ ' WHERE date='+date+' AND year='+year+' AND month='+month+';',[],
              function(trans,r){
                // console.log(r.rows)
                // sql_result.t_data = r.rows;
                
                for(var i=0;i<r.rows.length;i++){
                  items.push(r.rows.item(i));
                }
                $scope.t_data_list = items;
                console.log($scope.t_data_list);
                $scope.$apply();
              }
          )
        }
      )
      // 
    };
    $scope.removeData = function(t_name){
      var table_name = "t_data_table"
      var date = $scope.date;
      var year = $scope.year;
      var month = $scope.month;
      db.transaction(
        function(trans){
          trans.executeSql(
            'DELETE FROM '+table_name+' WHERE date='+date+' AND year='+year+' AND month='+month+' AND t_name="'+t_name+'";'
          )
        }
      )
    }
    $(document).on("click",".removeForm",function(){
      var state = $(this)
      var t = $scope.t_data_list
      var confirm = bootbox.confirm("Are you sure?",function(result) {
        // OKならtrueに、Cancelならfalseになります
        console.log(result);
        if(result){
          var i = state.parent().parent().index()
          state.parent().parent().remove();
          $scope.removeData(t[i].t_name);
        }else{
          // var i = state.parent().parent().index()
          // console.log(t[i].t_name);
        }
      })
    })
    $scope.saveData = function(){
      var t_name = $scope.selected_t
      var date = $scope.now_date
      var count = $scope.save_counts
      if(!count){
        alert("please input a count!");
        return
      }
      if(!date){
        alert("please input a date!");
        return
      }
      var year = $scope.year;
      var month = $scope.month;
      var date = $scope.date;
      console.log(count);
      console.log(t_name)
      console.log(date)
      var table_name = "t_data_table"
      db.transaction(
        function(trans){
          trans.executeSql(
            'INSERT INTO '
            +table_name
            +'(t_name,year,month,date,count) VALUES("'
            +t_name
            +'",'
            +year
            +','
            +month
            +','
            +date
            +','
            +count+');'
          )
        }
      )
    };
    // $scope.createForm = function(t){
    //   $scope.form_num += 1;
    //   var insert = '<div id="'+t.toLowerCase()+'" class="form-group row">'
    //                 +'<div class="col-xs-2" style="text-align:right">'
    //                     +t
    //                 +'</div>'
    //                 +'<div class="col-xs-4">'
    //                     +'<input class="form-control" type="number" placeholder="count">'
    //                 +'</div>'
    //                 +'<div class="col-xs-3">'
    //                     +'<button type="button" class="btn btn-primary btn-block">Save</button>'
    //                 +'</div>'
    //                 +'<div class="col-xs-3">'
    //                     +'<button type="button" class="btn btn-danger btn-block removeForm">Remove</button>'
    //                 +'</div>'
    //             +'</div>';
    //   $('#trainings').append(insert);
    // };
  });
  app.controller('settingCtrl',function($scope){
    $scope.t_list = t_list;
    $scope.createTable = function(){
      console.log("hoge");
      var t = $scope.selected_t
      if(!t){
        alert("please select a kind of training!");
        return
      }
      var table_name = "t_data_table";
      db.transaction(
        function(trans){
          trans.executeSql(
            'CREATE TABLE IF NOT EXISTS '+table_name
            +'(t_name TEXT NOT NULL,'
            +' year INTEGER NOT NULL,'
            +' month INTEGER NOT NULL,'
            +' date INTEGER NOT NULL,'
            +' count INTEGER NOT NULL);'
          )
        }
      )
    };
    $scope.removeTable = function(){
      console.log("hoge");
      var t = $scope.selected_t
      if(!t){
        alert("please select a kind of training!");
        return
      }
      var table_name = "t_data_table"
      db.transaction(
        function(trans){
          trans.executeSql(
            'DROP TABLE '+table_name+';'
          )
        }
      )
    };
  });
})();