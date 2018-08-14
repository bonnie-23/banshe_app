//
//const {app, BrowserWindow, Menu} = require('electron')
//const path = require('path')
//const url = require('url')
//const shell = require('electron').shell
//const $ = require('jquery')
//
//
//
//let mainWindow
//function createWindow () {
//  mainWindow = new BrowserWindow({width: 450, height: 700})
//  mainWindow.setMenu(null)
//  mainWindow.loadURL('http://127.0.0.1:5000/getallgoals/start')
//  mainWindow.on('closed', function () {
//    mainWindow = null
//  })
//
//mainWindow.loadURL('/index.html')
//mainWindow.webContents.openDevTools()
//}


function saveGoal() {


//    var form = document.getElementById('goalinput');
//    form.onsubmit = function() {
//        form.target = '_self';
//        };



//    document.location.href = "/insertgoal"index.html

//    var goal = {}
//            dict['event_name'] = document.getElementById('eventname').value
//            dict['event_deadline'] = document.getElementById('eventdeadline').value
//            dict['event_priority'] = document.getElementById('eventpriority').value
//            dict['event_reminder'] = document.getElementById('eventreminder').value
//
//    $.ajax({
//          url: "/insertgoal",
//          type: "POST",
//          contentType: "application/json;charset=UTF-8",
//          dataType: "JSON",
//          data: JSON.stringify(goal),
//          success: function() {
//            document.location.reload(true);

//    success: function (response) {
//      // Make sure the response actually has a redirect
//      if (response.redirect) {
//        console.log(response);
//      }
//    }

}


function addNew() {
    location.href = '/newgoal'
}


//populate input fields when table item selected
function selItem() {

    console.log(this)
    $('#gltable').on('click', 'td', function () {
    $("tr").removeClass("highlighted");
      $(this).closest('tr').css({'background-color': 'grey'});
    });


    var table = document.getElementById('gltable')
    for(var i=1; i< table.rows.length; i++) {
        table.rows[i].addEventListener('click', function() {

            var chk= document.getElementById("chckHead")
            var fmt = 'YYYY-MM-DDTHH:mm'
            var dead = moment.utc(this.cells[1].innerHTML,fmt)
            var create = moment.utc(this.cells[5].innerHTML,fmt)
            var date = new Date()

            var dict = {}
            dict['event_name'] = this.cells[0].innerHTML
            dict['event_deadline'] = dead.format(fmt)
            dict['event_priority'] = this.cells[2].innerHTML
            dict['event_reminder'] = this.cells[3].innerHTML
            dict['mongo_id'] = this.cells[4].innerHTML
            dict['event_createdate'] = create.format(fmt)
            dict['event_status'] = JSON.stringify(chk.checked)


            var editbtn = document.getElementById("editgoal")
            editbtn.addEventListener('click', function () {
                location.href = "/editgoal?dict=" + JSON.stringify(dict)
            });

            var delbtn = document.getElementById("deletegoal")
            delbtn.addEventListener('click', function () {
                location.href = "/deletegoal?dict=" + JSON.stringify(dict["mongo_id"])
            });

            var chk= document.getElementById("chckHead")
            chk.addEventListener('change', function() {
                if (chk.checked) { toggleGoal(dict) }
            });


        });

    };


    var comptable = document.getElementById('cptable')
    for(var i=1; i< cptable.rows.length; i++) {
        cptable.rows[i].addEventListener('click', function() {
            console.log('a')

            var cpdelbtn = document.getElementById("deletecp")
            cpdelbtn.addEventListener('click', function () {
                var cpdict = {}
                cpdict['mongo_id'] = this.cells[4].innerHTML
                location.href = "/deletegoal?dict=" + JSON.stringify(compdict["mongo_id"])

            });
        });
    }
}




function updateGoal(dict) {

    $.ajax({
        url: "/updategoal",
        type: "PUT",
        contentType: "application/json;charset=UTF-8",
        dataType: "JSON",
        data: JSON.stringify(dict),   // converts js value to JSON string
            });
    location.href = ''

}


//return the checked goal as a dictionary
function getGoal(checkitem) {
    if (checkitem.checked) {
         var row = checkitem.parentNode.parentNode;
         var cols = row.getElementsByTagName("td");
         var i=0;
         var dict = {}
         while (i < cols.length) {
            dict[cols[i].headers] = cols[i].textContent;
            i++;
            }
         return dict
    }
    else { console.log(checkitem)}
}


function toggleGoal(dict){
    $.ajax({
          url: "/togglegoal",
          type: "POST",
          contentType: "application/json;charset=UTF-8",
          dataType: "JSON",
          data: JSON.stringify(dict),
//          success: function() {
//            document.location.reload(true);
//            getAll()
//          }
        });
   getAll();
}

//filter displayed goals by period
function filterGoals () {
    var period = $("input:radio[name='filter']:checked").val()
    if (period == "today"){
        location.href = "/getgoalstoday";
        }
    else if (period == "this week"){
        location.href = "/getgoalsweek";
    }
    else if (period == "this month"){
        location.href = "/getgoalsmonth";
    }
}

function getAll() {
    location.href = "/getallgoals/start";
}



//clear form contents
function clearForm() {

    document.getElementById('eventname').value = ''
    document.getElementById('eventdeadline').value =  ''
    document.getElementById('eventpriority').value = 'Priority'
    document.getElementById('eventreminder').value = 'Remind Me'
    document.getElementById('updategoal').disabled = true
    document.getElementById('addgoal').disabled = false
}


//app.on('ready', createWindow)
//app.on('activate', function () {
//  if (mainWindow === null) {
//    createWindow()
//  }
//})