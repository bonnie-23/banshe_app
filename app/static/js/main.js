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

function addNew() {
    location.href = '/newgoal'
}


function saveGoal() {


    var save = document.getElementById("addgoal")

    var name = document.getElementById("eventname").value
    var deadline = document.getElementById("eventdeadline").value
    var priority = document.getElementById("eventpriority").value
    var reminder = document.getElementById("eventreminder").value


    if(name == "" || deadline == ""){
        alert("blank values")
        }
    else {
        var dict = {}
        dict['event_name'] = name
        dict['event_deadline'] = deadline
        dict['event_priority'] = priority
        dict['event_reminder'] = reminder

        $.ajax({
              url: "/insertgoal",
              type: "POST",
              contentType: "application/json;charset=UTF-8",
              dataType: "JSON",
              data: JSON.stringify(dict),
              success: function(data){
                alert(data);
              }
            });
    }


}






//Select an event in active or completed lists
function selItem() {
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



            //pass selected goal to edit page

            $("button.edtbtn").click( function () {
                location.href = "/editgoal?dict=" + JSON.stringify(dict)
            });

            //delete active selected goal

            $("button.delbtn").click( function () {
                confirmAction(dict["mongo_id"])
            });

            //mark selected goal as complete
            var chk= document.getElementById("chckHead")
            $("input.check").change( function() {
                console.log("a")
                if($(this).is(':checked')){
                    dict['event_status'] = JSON.stringify($(this).is(':checked'))
                    toggleGoal(dict)
                }
            });


        });

    };

    //delete completed goal from list
    var cptable = document.getElementById('cptable')

    for(var i=1; i< cptable.rows.length; i++) {
        cptable.rows[i].addEventListener('click', function() {

            var monid = this.cells[4].innerHTML
            var goalname= this.cells[0].innerHTML
            var cpdelbtn = document.getElementsByClassName("delbtn")

            var cpdict = {}
                cpdict['mongo_id'] = monid

            $("button.delbtn").click( function () {
                console.log(this)
                confirmAction(cpdict["mongo_id"])
            })

        });
    };
}




function confirmAction(mongo_id) {
                //confirm delete dialog
                $(function() {
                    $( "#confirmdel" ).dialog({
                        autoOpen: true,
                        resizable: false,
                        height: "auto",
                        title: 'Confirm Delete',
                        modal: true,
                        show: {
                                effect: "blind",
                                duration: 0
                        },
                        hide: {
                                effect: "explode",
                                duration: 0
                        },
                        buttons: {
                                    "Delete": function() {
                                      location.href = "/deletegoal?dict=" + JSON.stringify(mongo_id);
                                    },
                                    Cancel: function() {
                                      $( this ).dialog( "close" );
                                    }
                        }

                    });
                });
}



function updateGoal() {
    var name = document.getElementById("eventname").value
    var deadline = document.getElementById("eventdeadline").value
    var priority = document.getElementById("eventpriority").value
    var reminder = document.getElementById("eventreminder").value
    var create = document.getElementById("eventcreate").value
    var monid = document.getElementById("mongoid").value


    var dict = {}
    dict['event_name'] = name
    dict['event_deadline'] = deadline
    dict['event_priority'] = priority
    dict['event_reminder'] = reminder
    dict['mongo_id'] = monid
    dict['event_createdate'] = create



    $.ajax({
        url: "/updategoal",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        dataType: "JSON",
        data: JSON.stringify(dict)
    });

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
          success: function() {

          }
        });
    window.location.reload()
}

//filter displayed goals by period
function filterGoals () {
    var period = $("input:radio[name='filter']:checked").val()
    if (period == "tomorrow"){
        location.href = "/getgoalstomorrow";
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



//check every 60 seconds if deadline for goals have arrived
function dueGoals() {

    var events = $("#events").data("events");
    setInterval(getDue,60000);

    function getDue() {
        cnt= events
        var temp =JSON.parse(events.replace(/\'/g,'\"'))
        var active_events = temp['active']

        var i;
        for(i=0; i < active_events.length; i++){
            if (active_events[i]["event_deadline"] == getToday()){
                alert("Deadline Arrived");
            }
        }


    };

    function getToday() {
        var currentdate = new Date()
        var today = currentdate.getFullYear() + "-" +
        0 + (currentdate.getMonth()+1) + "-" +
        currentdate.getDate() + " " +
        currentdate.getHours() + ":" +
        currentdate.getMinutes() + ":" +
        "00"

        return  today
    };


    function stopCheck() {
        clearInterval(intervalID)
    };
}


//app.on('ready', createWindow)
//app.on('activate', function () {
//  if (mainWindow === null) {
//    createWindow()
//  }
//})