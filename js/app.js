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
//http://work.smarchal.com/twbscolor/
//http://scene-live.com/page.php?page=49

"use strict";
(function() {
  // ==== Using LocalStorage ====
  function setLS(key,item,obj_flag=0){
    if(obj_flag==1){
      item = JSON.stringify(item);
      localStorage.setItem(key,item);
    }else{
      localStorage.setItem(key,item);
    }
  }
  function getLS(key){
    var item = localStorage.getItem(key);
    var obj = JSON.parse(item);
    return obj;
  }
  // ==== initialize ====
  var app = angular.module('trainingApp', []);
  var dbName = 't-App';
  var version = '1.0';
  var displayName = 't-App';
  var estimatedSize = 65536;
  var t_list = ["Push_ups","Plank","Crunch","Side-Crunch","Running","Back_Extension"];

  // ローカルストレージにトレーニングメニューを保存して置く
  // training_listがまだ無かったらデフォルトのトレーニングメニューを入れておく．
  if (!getLS("training_list")){
    setLS("training_list",["Push_ups","Plank","Crunch","Side-Crunch","Running","Back_Extension"],1)
  }
  
  var db = openDB(); // WebSQLを使うためのDB接続処理
  // ==== Web SQL ====
  function openDB(){
    return openDatabase(dbName, version, displayName, estimatedSize);
  }


  //sql文の実行
  // TODO:最初に色々書いたところもこれ使いたい
  function do_sql(sql_state,callback=0){
    db.transaction(
        function(trans){
          trans.executeSql(
            sql_state
          )
          if(callback!=0){
            callback();
          }
        }
      )
  }

  //アプリケーション全体のコントローラ
  app.controller('appCtrl', function($scope,color) {
    // 後々UIの色を変えられるようにしたい
    // そのための初期値
    $scope.active_tab = "home";
    $scope.base_color = "#000000";
    $scope.b_color = "#000000";
    $scope.t_color = "#ffffff";

    // タブの切り替え
    $scope.setTab = function(active_tab){
      $scope.active_tab = active_tab;
    };

    // ベースカラーの変更
    $scope.changeBaseColor = function(){
      if(!color.b_color){
        alert("Please select the base color.");
        return;
      }
      $scope.base_color = color.b_color;
    }

    // テキストカラーの変更
    $scope.changeTextColor = function(){
      if(!color.t_color){
        alert("Please select the text color.");
        return;
      }
      $scope.text_color = color.t_color;
    }
  });

  //Directiveの設定
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
      if(!$scope.graph_date){
        alert("please input a date!");
        return
      }
      var table_name = "t_data_table"
      var year = $scope.graph_date.getFullYear()
      var month = $scope.graph_date.getMonth()+1
      var sql_state = 'SELECT t_name,count,date FROM '+table_name+ ' WHERE year='+year+' AND month='+month+';'

      // Create label
      var label = []
      var graph_data_dict = {}
      var graph_data_dict_time = {}
      $.each(t_list,function(index,val){
        if(val=="Plank"){
	  graph_data_dict_time[val] = []
          return true;
        }
	if(val=="Running"){
	  return true;
	}
        graph_data_dict[val]=[]
      })
      for(var i=1;i<32;i++){
        label.push(year+" / "+month+" / "+i);
        $.each(graph_data_dict,function(key){
          graph_data_dict[key].push(0);
        })
	$.each(graph_data_dict_time,function(key){
	  graph_data_dict_time[key].push(0)
	})
      }
      console.log(graph_data_dict)

      //Create data
      console.log(label);
      $scope.selectSql(sql_state,function(){
        //Create data
        $.each($scope.graph_data_list,function(index,val){
	  for(var key in graph_data_dict){
	    if(key==val.t_name){
	      graph_data_dict[val.t_name][val.date-1]=val.count;
	      break
	    }
	  }
	  for(var key in graph_data_dict_time){
	    if(key==val.t_name){
	      graph_data_dict_time[val.t_name][val.date-1]=val.count;
	      break
	    }
	  }
          // graph_data_dict[val.t_name][val.date-1]=val.count;
        })
        console.log($scope.graph_data_list);
        var ctx_push = document.getElementById("myPushChart").getContext("2d");
        var ctx_crunch = document.getElementById("myCrunchChart").getContext("2d");
        ctx_push.canvas.width = 600;
        ctx_push.canvas.height = 200;
        ctx_crunch.canvas.width = 600;
        ctx_crunch.canvas.height = 200;
        var datasets = []
	var datasets_for_time = []
        var backgroundColor = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
        ]
        var borderColor =  [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ]
        var i = 0;
        $.each(graph_data_dict,function(key){
          datasets.push({
            label:key,
            backgroundColor:backgroundColor[i],
            borderColor:borderColor[i],
            data: graph_data_dict[key],
          })
          i += 1
        })
        $.each(graph_data_dict_time,function(key){
          datasets_for_time.push({
            label:key,
            backgroundColor:backgroundColor[i],
            borderColor:borderColor[i],
            data: graph_data_dict_time[key],
          })
          i += 1
        })

        // var type = "line"
        var type = "bar"
        var push_ups_data = {
            labels: label,
            datasets:datasets,
            // datasets: [
            //     {
            //         label: "Push_ups",
            //         backgroundColor: "rgba(75,192,192,0.6)",
            //         borderColor: "rgba(75,192,192,1)",
            //         data: graph_data_dict["Push_ups"],
            //     },{
            //         label: "Crunch",
            //         backgroundColor: "rgba(255, 99, 132, 0.6)",
            //         borderColor: "rgba(255,99,132,1)",
            //         data: graph_data_dict["Crunch"],
            //     }
            // ]
        };
	var crunch_data = {
	    labels: label,
	    datasets:datasets_for_time,
	}
        // var crunch_data = {
        //     labels: label,
        //     datasets: [
        //         {
        //             label: "Crunch",
        //             fill: false,
        //             lineTension: 0.1,
        //             backgroundColor: "rgba(255, 99, 132, 0.6)",
        //             borderColor: "rgba(255,99,132,1)",
        //             borderCapStyle: 'butt',
        //             borderDash: [],
        //             borderDashOffset: 0.0,
        //             borderJoinStyle: 'miter',
        //             pointBorderColor: "rgba(255,99,132,1)",
        //             pointBackgroundColor: "#fff",
        //             pointBorderWidth: 1,
        //             pointHoverRadius: 5,
        //             pointHoverBackgroundColor: "rgba(255, 99, 132, 0.4)",
        //             pointHoverBorderColor: "rgba(255,99,132,1)",
        //             pointHoverBorderWidth: 2,
        //             pointRadius: 1,
        //             pointHitRadius: 10,
        //             data: crunch,
        //             spanGaps: false,
        //         }
        //     ]
        // };
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
          delete $scope.t_data_list[t_name];
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
          $scope.t_data_list.splice(i,1) ;
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
          $scope.t_data_list.push({"t_name":t_name,"count":count})
          $scope.$apply()
        }
      )
    };
    $(document).on("click",".updateData",function(){
      var state = $(this)
      var add_count = Number(state.parent().parent().children().eq(3).children(".add").val())
      state.parent().parent().children().eq(3).children(".add").val(null)
      if(!add_count){
        alert("please input add_count.");
        return
      }
      var pre_count = Number(state.parent().parent().children().eq(2).text())
      var t_name = state.parent().parent().children().eq(1).text()
      var date = $scope.date;
      var year = $scope.year;
      var month = $scope.month;
      var table_name = "t_data_table"
      var i = state.parent().parent().index()
      var count = add_count+pre_count
      var sql_state = "UPDATE "+table_name+" SET count="+count+" WHERE date="+date+" AND month="+month+" AND year="+year+" AND t_name='"+t_name+"';"
      console.log(sql_state)
      do_sql(sql_state,function(){
        $scope.t_data_list[i].count = count;
        $scope.$apply()
      });
    })
    // $scope.updateData = function(){
    //   var state = $(this)
    //   console.log(state.eq(1));
    // }
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

  app.factory('color', function () {
    return { b_color: '',t_color: ''};
  });
  app.controller('settingCtrl',function($scope,color){
    $scope.t_list = t_list;
    $scope.b_color = color.b_color;
    $scope.$watch('b_color', function(newValue, oldValue, scope) {
        if(angular.equals(newValue, oldValue)) {
            console.log('ok');
        } else {
            color.b_color=newValue;
            console.log(color.b_color);
        }
    });
    $scope.$watch('t_color', function(newValue, oldValue, scope) {
        if(angular.equals(newValue, oldValue)) {
            console.log('ok');
        } else {
            color.t_color=newValue;
            console.log(color.t_color);
        }
    });
    $scope.addTraining = function(){
      t_list.push($scope.add_train);
      setLS("training_list",t_list,1);
      $scope.add_train = "";
    }
    $scope.createTable = function(){
      // console.log("hoge");
      // var t = $scope.selected_t
      // if(!t){
      //   alert("please select a kind of training!");
      //   return
      // }
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
      var confirm = bootbox.confirm("Are you sure?",function(result) {
        // OKならtrueに、Cancelならfalseになる
        console.log(result);
        if(result){
          var table_name = "t_data_table"
            db.transaction(
              function(trans){
                trans.executeSql(
                  'DROP TABLE '+table_name+';'
                )
              }
            )
        }else{
          // var i = state.parent().parent().index()
          // console.log(t[i].t_name);
        }
      })
    };
  });
})();
