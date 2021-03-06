from flask import Flask, jsonify, request, render_template, redirect, url_for
from app import mongo,app
import ast
import sys
from .core import Event, DateSlice, Todo
from datetime import datetime
from bson.objectid import ObjectId



#class API:
#    def __init__(self):
#        self.app = Flask(__name__)
#        self.mongo = MongoDB()

        #self.app.config['MONGO_DBNAME'] = 'banshe_events'
        #self.app.config['MONGO_URI'] = 'mongodb://127.0.0.1:27017'
        #self.mongo = PyMongo(self.app)

#        self.app.add_url_rule('/getallgoals/', 'getallgoals/',self.get_all_goals,methods = ['GET'])
#        self.app.add_url_rule('/getactivegoals/', 'getactivegoals/', self.get_active_goals, methods=['GET'])
#        self.app.add_url_rule('/getgoalstoday/', 'getgoalstoday/',self.get_goals_today, methods = ['GET'])
#        self.app.add_url_rule('/getgoalsweek/', 'getgoalsweek/', self.get_goals_week, methods=['GET'])
#        self.app.add_url_rule('/getgoalsmonth/', 'getgoalsmonth/', self.get_goals_month, methods=['GET'])
#        self.app.add_url_rule('/getonegoal/', 'getonegoal/', self.get_one_goal, methods=['GET','POST'])

#        self.app.add_url_rule('/insertgoal/', 'insertgoal/', self.insert_goal, methods=['GET', 'POST'])
#        self.app.add_url_rule('/updategoal/', 'updategoal/', self.update_goal, methods=['GET', 'POST'])
#        self.app.add_url_rule('/togglegoal/', 'toggletegoal/', self.toggle_goal, methods=['GET', 'POST'])

#        self.app.add_url_rule('/deleteonegoal/', 'deleteonegoal/', self.delete_goal, methods=['GET', 'POST'])
#        self.app.add_url_rule('/removeallgoals/', 'removeallgoals/', self.remove_all, methods=['GET', 'POST'])


#        self.app.add_url_rule('/inserttodo/', 'inserttodo/', self.insert_todo, methods=['GET', 'POST'])
#        self.app.add_url_rule('/updatetodo/', 'updatetodo/', self.update_todo, methods=['GET', 'POST'])
#        self.app.add_url_rule('/deletetodo/', 'deletetodo/', self.delete_todo, methods=['GET', 'POST'])
#        self.app.add_url_rule('/getalltodo/', 'getalltodo/', self.get_todos, methods=['GET', 'POST'])
#        self.app.add_url_rule('/getonetodo/', 'getonetodo/', self.get_one_todo, methods=['GET', 'POST'])

#        self.app.add_url_rule('/toggletodo/', 'toggletodo/', self.toggle_todo, methods=['GET', 'POST'])





def makeevent(event):
    eventrecord = \
        Event(
            event['event_name'],
            event['event_priority'],
            event['event_status'],
            event['event_deadline'],
            event['event_todolist'],
            event['event_reminder'],
            event['event_createdate'])
    return eventrecord

def makeeventlist(lst,item):
    lst.append({'event_name': item['event_name'],
                    'event_priority': item['event_priority'],
                    'event_status': item['event_status'],
                    'event_todolist': ast.literal_eval(item['event_todolist']),
                    'event_reminder': item['event_reminder'],
                    'event_deadline': item['event_deadline'],
                    'event_createdate': item['event_createdate'],
                    'mongo_id': str(item['_id'])

                    })
    return lst

'''
takes html datetime-local and convert to python date
'''
def fixdate(dateval):
    d= dateval.replace('T', ' ')
    return datetime.strptime(d.replace('-','/'),'%Y/%m/%d %H:%M')

def getbool(check):
    if check == 'true':
        return True
    else:
        return False

def splitstat(cursor):
    output, active, completed = {}, [], []
    for i in cursor:
        if i['event_status']=='False':
            active = makeeventlist(active,i)
        elif i['event_status']=='True':
            completed = makeeventlist(completed, i)
    output['active']= active
    output['completed'] = completed

    return output

'''
Get all events in MongoDb create a dictionary for each record and append to a list
'''
@app.route('/getallgoals/<page>', methods=['GET'])
def get_all_goals(page):

    if page == "start":
        return render_template('index.html', events = splitstat(mongo.getall('event',{})),title='Banshe')
    elif page == "edit":
        return render_template('editgoal.html')

'''
Get events within a range day, week, month using a slice object
'''
@app.route('/getgoalstoday', methods=['GET'])
def get_goals_today():
    output = []
    for i in mongo.getall('event',{}):
        event = makeevent(i)
        slice = event.getslice().day.date()
        deadline = datetime.strptime(i['event_deadline'],'%Y-%m-%d %H:%M:%S').date()

        if  deadline == slice:
            output.append(i)
    return render_template('index.html', events = splitstat(output),title='Banshe')


@app.route('/getgoalsweek', methods=['GET'])
def get_goals_week():
    output = []
    for i in mongo.getall('event',{}):
        event = makeevent(i)
        slice = event.getslice().week
        deadline = datetime.strptime(i['event_deadline'], '%Y-%m-%d %H:%M:%S').date()

        if slice[0].date() <= deadline <= slice[1].date():
            output.append(i)
    return render_template('index.html', events=splitstat(output), title='Banshe')

@app.route('/getgoalsmonth', methods=['GET'])
def get_goals_month():
    output = []
    for i in mongo.getall('event',{}):
        event = makeevent(i)
        slice = event.getslice().month
        deadline = datetime.strptime(i['event_deadline'], '%Y-%m-%d %H:%M:%S').date()

        if slice[0].date() <= deadline <= slice[1].date():
            output.append(i)

    # return jsonify(splitstat(output))
    return render_template('index.html', events=splitstat(output), title='Banshe')


'''
takes goal name and deadline retrieves event from mongoDb
'''
@app.route('/getonegoal', methods = ['POST'])
def get_one_goal():
    output = []
    goal = request.json
    record = mongo.getonerecord({'_id': ObjectId(goal['mongo_id'])},'event')
    for i in record:
        output.append({'event_name': i['event_name'],
                        'event_priority': i['event_priority'],
                        'event_status': i['event_status'],
                        'event_todolist': i['event_todolist'],
                        'event_reminder': i['event_reminder'],
                        'event_deadline': i['event_deadline'],
                        'event_createdate': i['event_createdate'],
                        'mongo_id' : str(i["_id"])
                        })
    return  jsonify(output)



@app.route('/newgoal', methods = ['GET'])
def new_goal():
    return render_template("creategoal.html", title = 'New Goal')
@app.route('/editgoal', methods = ['GET'])
def edit_goal():
    dict= request.args.get('dict')
    print(dict)
    return render_template("editgoal.html", dict = ast.literal_eval(dict), title = 'Edit')
    # return dict



'''
gets event object and inserts into MongoDB
'''
@app.route('/insertgoal', methods=['GET','POST'])
def insert_goal():
    if request.form.get('eventname') and request.form.get('eventdeadline'):
        eventrecord = makeevent({ 'event_name': request.form.get('eventname'),
                                       'event_priority': request.form.get('eventpriority'),
                                       'event_status': "False",
                                       'event_deadline': fixdate(request.form.get('eventdeadline')),
                                       'event_todolist': "[]",
                                       'event_reminder': request.form.get('eventreminder'),
                                       'event_createdate': datetime.now().replace(second=0,microsecond=0)})

        # return jsonify(request.form.get('eventdeadline'))
        eventrecord.insert_event()
        return redirect(url_for('get_all_goals',page='start'))
        #return  render_template('response.html', insresult = eventrecord.insert_event())
    else:
        return render_template('response.html', insresult = 'Event or deadline is blank')



'''
takes goal and updates in mongoDB
once user selects edit getongoal is run. 
that record is now old goal.
new goal is the modified 
replaces that event in mongodb to save changes
'''
@app.route('/updategoal', methods=['GET','POST'])
def update_goal():
    if request.method == 'POST':
        goal = request.form.get('eventname')
        eventrecord = makeevent({
            'event_name': request.form.get('eventname'),
             'event_priority': request.form.get('eventpriority'),
             'event_status': "False",
             'event_deadline': fixdate(request.form.get('eventdeadline')),
             'event_todolist': "[]",
             'event_reminder': request.form.get('eventreminder'),
             'event_createdate': fixdate(request.form.get('eventcreate'))
            })
        return  render_template('response.html', insresult = eventrecord.update(request.form.get('mongoid'),eventrecord))

'''Remove single document from MongoDB'''
@app.route('/deletegoal', methods=['GET'])
def delete_goal():
    monid = {'_id': ObjectId(ast.literal_eval(request.args.get('dict')))}
    goalrecord = mongo.getonerecord(monid,'event')
    for i in goalrecord:
        mongo.deleteevent(i["_id"])
    print(monid)
    return render_template("response.html", insresult ="Goal Deleted!")

'''Remove all documents'''
@app.route('/removeall', methods=['GET'])
def remove_all():
    mongo.remove_all_records()
    return 'All Records Removed'


'''
toggle goal status
'''
@app.route('/togglegoal', methods=['POST'])
def toggle_goal():
    if request.method == 'POST':
        record = mongo.getonerecord({'_id': ObjectId(request.json['mongo_id'])},'event')
        for i in record:
            eventrecord = makeevent(i)
            eventrecord.toggle_event(i['_id'],str(getbool(request.json['event_status'])))

            print(eventrecord.status)
        # return render_template('index.html')
        return render_template('response.html', insresult= request.json['event_status'])
    else:
        return jsonify ('yes')


'''
gets event name and event deadline and event todo inserts todo to that event
'''
def insert_todo():
    goal = request.json
    record = mongo.getonerecord({'event_name': goal['event_name'],
                                        'event_deadline': goal['event_deadline']},'event')
    for i in record:
        eventrecord = makeevent(i)
        eventrecord.add_todo(i['_id'],
                                goal["event_todo"]["todo_name"],
                                goal["event_todo"]["todo_status"])

    return jsonify('Todo Inserted')



def update_todo():
    record = request.json
    goal = record['old']
    oldtodo = ast.literal_eval(goal['event_todolist'])[0]

    newtodo = Todo(oldtodo['goal_id'],
                record['new']['todo_name'],
                oldtodo['todo_status'])
    newtodo.update(oldtodo['todo_id'])

    mongogoal = mongo.getonerecord({'_id': ObjectId(goal['mongo_id'])},'event')

    for i in mongogoal:
            todolist = ast.literal_eval(i['event_todolist'])
            todolist.remove(oldtodo)
            todolist.append({'goal_id': oldtodo['goal_id'],
                        'todo_name': record['new']['todo_name'],
                        'todo_status':oldtodo['todo_status']})

            eventrecord = \
                Event(
                    i['event_name'],
                    i['event_priority'],
                    i['event_status'],
                    i['event_deadline'],
                    str(todolist),
                    i['event_reminder'],
                    i['event_createdate'])
            eventrecord.update(goal['mongo_id'], eventrecord)

    return jsonify(mongogoal.count())


def delete_todo():
    todorecord = request.json['event_todo']
    mongo.removerecord(todorecord,'todo')
    mongogoal = mongo.getonerecord({'_id': ObjectId(todorecord['goal_id'])},'event')

    for i in mongogoal:
        todolist = ast.literal_eval(i['event_todolist'])
        try:
            todolist.remove(todorecord)
        except:
            pass


        eventrecord =  \
            Event(
                i['event_name'],
                i['event_priority'],
                i['event_status'],
                i['event_deadline'],
                str(todolist),
                i['event_reminder'],
                i['event_createdate'])
        eventrecord.update(i['_id'], eventrecord)
    return  jsonify('Todo Deleted!')

def get_one_todo():
    output = []
    todorecord = request.json
    record = mongo.getonerecord({'goal_id': ObjectId(todorecord['goal_id']),
                                            'todo_name': todorecord['todo_name']}, 'todo')
    for i in record:
        output.append({'goal_id': str(i['goal_id']),
                        'todo_name': i['todo_name'],
                        'todo_status': i['todo_status'],
                        'mongo_id': str(i["_id"])
                        })
    return jsonify(output)


def get_todos():
    output = []
    for i in mongo.getall('todo',{}):
        output.append({
            'goal_id': str(i['goal_id']),
            'todo_name': i['todo_name'],
            'todo_status': i['todo_status']
        })
    return jsonify (output)

def toggle_todo():
    todorecord = request.json
    mongotodo = mongo.getonerecord({'_id': ObjectId(todorecord['todo_id'])},'todo')
    for i in mongotodo:
        todo = Todo(i['goal_id'],i['todo_name'], i['todo_status'])
        status = todo.toggle_todo(i['_id'])
    return jsonify(status)

