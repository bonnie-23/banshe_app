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



    $("#insertdiag").dialog({
        autoOpen: true,
        resizable: false,
        modal: true,
        width: 400,
        height:350,
        open: function () {
            var insform = document.getElementById("insertdiag");
            insform.style.visibility = "visible";
            insform.style.display = "block";
        },
        buttons: {
                    "save": function () {

                        var currentdate = new Date()
                        var name = document.getElementById("ins_eventname").value
                        var deadline = document.getElementById("ins_eventdeadline").value
                        var priority = document.getElementById("ins_eventpriority").value
                        var reminder = document.getElementById("ins_eventreminder").value

                        if(name == "" || deadline == ""){
                            alert("blank values")
                        }
                        else if (deadline < currentdate){
                            alert("select future date and time")
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
                            getAll();
                        }


                    },
                    "cancel": function () {
                        $(this).dialog("close");
                    },
                    "clear": function () {
                        $(this).dialog("close");
                    }

        }
    });
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
            var editdeadline = this.cells[1].innerHTML
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




            //edit active selected goal
            $("button.edtbtn").click( function () {
                $("#editdiag").dialog({
                    autoOpen: true,
                    resizable: false,
                    modal: true,
                    width: 400,
                    height:350,
                    open: function () {
                         var form = document.getElementById("editdiag");
                         form.style.visibility = "visible";
                         $('#edit_eventname').val(dict['event_name']);
                         $('#edit_eventdeadline').val(dict['event_deadline']);
                         $('#edit_eventpriority').val(dict['event_priority']);
                         $('#edit_eventreminder').val(dict['event_reminder']);
                         $('#eventcreate').val(dict['event_createdate']);
                         $('#mongid').val(dict['mongo_id']);

                    },
                    close: getAll,
                    buttons: {
                        "save": function () {
                            updateGoal();
                            getAll();
                        },
                        "cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });

            });

            //delete active selected goal
            $("button.delbtn").click( function () {
                confirmAction(dict["mongo_id"])
            });

            //mark selected goal as complete
            var chk= document.getElementById("chckHead")
            $("input.check").change( function() {
                if($(this).is(':checked')){
                    dict['event_status'] = JSON.stringify($(this).is(':checked'));
                    checkGoal(dict);
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


//commit changes to goal
function updateGoal() {
    var name = document.getElementById("edit_eventname").value
    var deadline = document.getElementById("edit_eventdeadline").value
    var priority = document.getElementById("edit_eventpriority").value
    var reminder = document.getElementById("edit_eventreminder").value
    var create = document.getElementById("eventcreate").value
    var monid = document.getElementById("mongid").value


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


function checkGoal(dict){

    chck = document.getElementById("chckHead")

    dict["event_status"]= JSON.stringify(true)

    $.ajax({
          url: "/togglegoal",
          type: "POST",
          contentType: "application/json;charset=UTF-8",
          dataType: "JSON",
          data: JSON.stringify(dict),
          success: function() {

          }
        });
    window.location.reload();
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
function loadPage() {
    //Hide Edit Form
    var editform = document.getElementById("editdiag");
    editform.style.visibility = "hidden";
    editform.style.display ="none";

    //Hide Ins Form
    var insform = document.getElementById("insertdiag")
    insform.style.visibility = "hidden";
    insform.style.display ="none";

    //Get list of events from MongoDB and set interval to check deadlines
    var events = $("#events").data("events");
    interval = setInterval(getDue,8000);

    //Check each goal every interval to see if deadline has arrived
    function getDue() {
        var temp =JSON.parse(events.replace(/\'/g,'\"'))
        var active_events = temp['active']

        var i;
        for(i=0; i < active_events.length; i++){
            if (active_events[i]["event_deadline"] == getToday()){

                goal=active_events[i]
                name= active_events[i]["event_name"]
                mongo_id= active_events[i]["mongo_id"]
                $("#deadlinearr").dialog({
                    autoOpen: true,
                    resizable: false,
                    height: "auto",
                    title: 'Notification',
                    modal: true,
                    open: function () {
                        $('#notlabel').html(name)
                    },
                    buttons: {
                                "Delete": function() {
                                    confirmAction(mongo_id);
                                    clearInterval(interval)
                                },
                                "Mark Complete": function() {
                                  checkGoal(goal);
                                  clearInterval(interval)
                                }
                    }
                })
            };
        };


    }

    //Build string of todays date time
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