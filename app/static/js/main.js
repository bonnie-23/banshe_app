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


function newGoal() {

    $("#editdiag").dialog({
        autoOpen: true,
        resizable: false,
        title: "Add New Goal",
        modal: true,
        width: 400,
        height:350,
        open: function () {
            var insform = document.getElementById("editdiag");
            insform.style.visibility = "visible";
            insform.style.display = "block";

            var tomoro = moment().add(1,'days')
            $("#edit_eventdeadline").val(tomoro.toJSON().slice(0,16))
//            console.log(tom.toString().slice(0,21))

        },
        buttons: {
                    "save": function () {
                        var events = $("#events").data("events");
                        var temp =JSON.parse(events.replace(/\'/g,'\"'))
                        var active_events = temp['active']

                        for (i in active_events){
                            if (active_events[i]['event_name'] ==  $("#edit_eventname").val()){
                                alert("That event already exists")
                            }

                        }
                        saveGoal("save");
                    },
                    "cancel": function () {
                        $(this).dialog("close");
                    },
                    "clear": function () {
                        clearForm("goal");
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
            $("button.edtbtn").click( function (event) {
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
                            saveGoal("edit");
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
                deleteGoal(dict["mongo_id"])
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
                deleteGoal(cpdict["mongo_id"])
            })

        });
    };
}




function deleteGoal(mongo_id) {
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
function saveGoal(action) {
    var name = document.getElementById("edit_eventname").value
    var deadline = document.getElementById("edit_eventdeadline").value
    var priority = document.getElementById("edit_eventpriority").value
    var reminder = document.getElementById("edit_eventreminder").value
    var create = document.getElementById("eventcreate").value
    var monid = document.getElementById("mongid").value

    var dict = {}
    var currentdate = new Date().setSeconds(0,0)

    if(name == "" || deadline == ""){
            alert("blank values")
        }
    else if (new Date(deadline) <= new Date(currentdate)){
        alert("select future date and time")
    }
    else {
        if (action=="edit") {
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
        else if (action=="save") {

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
        getAll();
    }

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

//Mark a goal as complete
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
function clearForm(formname) {

    if (formname == "goal"){
        try {
            document.getElementById('edit_eventname').value = ''
            document.getElementById('edit_eventdeadline').value =  ''
            document.getElementById('edit_eventpriority').value = 'Priority'
            document.getElementById('edit_eventreminder').value = 'Remind Me'
        }
        catch(err) {

        }

    }
}



//check every 60 seconds if deadline for goals have arrived
function loadPage() {

    //Hide Edit Form
    var editform = document.getElementById("editdiag");
    editform.style.visibility = "hidden";
    editform.style.display ="none";


    //Hide today list
    var todaylist = document.getElementById("duetodaydiag")
    todaylist.style.visibility = "hidden";
    todaylist.style.display ="none";


    //Get events from MongoDB
    var events = $("#events").data("events");
    var temp =JSON.parse(events.replace(/\'/g,'\"'))
    var today_events = temp['duetoday']
    var active_events = temp['active']


    //check for reminders
    remFrequency()

    //call countdown dialog only once
    $("#events").one('on', function () {
        countToday();
    })


    //Display dialog for goals countdown
    function countToday(){
        $('<ul id="newDialogText"></ul>').dialog({
            autoOpen: true,
            resizable: false,
            height: "auto",
            title: 'due today',
            modal: true,
            open: function () {
                for(i=0; i < today_events.length; i++) {
                    $("#newDialogText").append(
                        countdownTimer(today_events[i]['event_name'],today_events[i]['event_deadline'])
                    )

                }

            }
        });

    }


    //countdown timer to deadline W3Schools
    function countdownTimer(eventname,deadline){
        var countDownDate = new Date(deadline).getTime();
        var new_id = Math.floor((Math.random() * 999) + 1)


        return $('<li id=_' +new_id+'>').append (
            count()
        )


        function count() {
            var x = setInterval(function() {
                var now = new Date().getTime();
                var distance = countDownDate - now;

                    if (distance > 0) {
                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                        $('#_' + new_id).html(eventname + ": " + hours + "h " + minutes + "m " + seconds + "s ")

                    }

                    else if (distance == 0) {
                        clearInterval(x);
                        val = "EXPIRED";
                        return val
                    }
            }, 1000);

        };
    }


    //Check each goal every 60s to see if deadline has arrived
    interval = setInterval(getDue,60000);
    function getDue() {

        //check for events with deadline today
        var i;
        for(i=0; i < today_events.length; i++){
            var deadline = today_events[i]["event_deadline"]

            if ( deadline == getToday()){
                goal=today_events[i]

                name= goal["event_name"]
                mongo_id= goal["mongo_id"]
                showNotification(name,'Expired Deadline')


            }
        }

    }

    //Build string of todays date time YYYY-MM-DD HH:SS
    function getToday() {
        var currentdate = new Date()
        var today = currentdate.getFullYear() + "-" +
        (pad(currentdate.getMonth()+1)) + "-" +
        pad(currentdate.getDate()) + " " +
        pad(currentdate.getHours()) + ":" +
        pad(currentdate.getMinutes()) + ":" +
        "00"


        function pad(n, width=2, z=0) {
          z = z || '0';
          n = n + '';
          while(n.length<width) n = '' + z + n;
          return n
        }
        return  today
    };


    function stopCheck() {
        clearInterval(intervalID)
    };

    //show notification based on reminder frequency
    function remFrequency() {

        function freq(period) {
            return 30000 //* 60 * 60 * period;
        }

        for(i=0; i < active_events.length; i++){
            name = active_events[i]['event_name']
            deadline = active_events[i]['event_deadline']

            this.$description = $( '<p></p>' );
            message = '<strong>' +name+ '</strong>' + ' is due on: <br/>' + deadline

            while (deadline!=getToday()){
                if (active_events[i]['event_reminder']=='daily') {
    //                    setInterval(function () {
    //                        showNotification( message,'Reminder')
    //
    //                    },freq(24))
                }
                else if (active_events[i]['event_reminder']=='weekly') {
//                    setInterval(function () {
//                        showNotification( message,'Reminder')
//
//                    },freq(24*7))

                }
                else if (active_events[i]['event_reminder']=='monthly') {
//                    setInterval(function () {
//                        showNotification( message,'Reminder')
//
//                    },freq(24*30))
                }

            }

    }
}

//display notification
function showNotification(name,message) {

    clone = $("#deadlinearr").clone(true);

    $(clone).dialog({
        autoOpen: true,
        resizable: false,
        height: "auto",
        title: message,
        modal: true,
        open: function () {
            $(this).html(name);
        },
        buttons: {

                    "Delete": function() {
                        deleteGoal(mongo_id);
                    },
                    "Mark Complete": function() {
                        checkGoal(goal);

                    }

        }
    });
}
//app.on('ready', createWindow)
//app.on('activate', function () {
//  if (mainWindow === null) {
//    createWindow()
//  }
//})