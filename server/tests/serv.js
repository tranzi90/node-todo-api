const expect = require('expect');
const request = require('supertest');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {ObjectID} = require('mongodb');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', function () {
    it('should create a new todo', function (done) {
        var text = 'testik';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res) => expect(res.body.text).toBe(text))
            .end(function (err) {
                if (err)
                    return done(err);

                Todo.find({text}).then(function (todos) {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create wrong todo ', function (done) {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end(function (err) {
                if (err)
                    return done(err);

                Todo.find().then(function (todos) {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', function () {
    it('should get all todos', function (done) {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => expect(res.body.todos.length).toBe(1))
            .end(done);
    });
});

describe('GET /todos/:id', function () {
    it('should get todo with id', function (done) {
        request(app)
            .get(`/todos/${todos[0]._id.toString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not get someone else\'s todo', function (done) {
        request(app)
            .get(`/todos/${todos[1]._id.toString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if no such todo', function (done) {
        request(app)
            .get(`/todos/${new ObjectID().toString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', function (done) {
        request(app)
            .get(`/todos/123`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', function () {
    it('should remove a todo', function (done) {
        let id = todos[1]._id.toString();

        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo._id).toBe(id);
            })
            .end(function (err, res) {
                if (err)
                    return done(err);

                Todo.findById(id).then(function (todo) {
                    expect(todo).toBeNull();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not remove someone else\'s todo', function (done) {
        let id = todos[0]._id.toString();

        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(function (err, res) {
                if (err)
                    return done(err);

                Todo.findById(id).then(function (todo) {
                    expect(todo).toBeDefined();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if no such todo', function (done) {
        request(app)
            .delete(`/todos/${new ObjectID().toString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', function (done) {
        request(app)
            .delete(`/todos/123`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', function () {
    it('should update todo', function (done) {
        let id = todos[0]._id.toString();
        let newTodo = {
            text: 'test',
            completed: true
        };

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(newTodo)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo.text).toBe(newTodo.text);
                expect(res.body.todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it('should not update someone else\'s todo', function (done) {
        let id = todos[0]._id.toString();
        let newTodo = {
            text: 'test',
            completed: true
        };

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(newTodo)
            .expect(404)
            .end(done);
    });

    it('should clear compAt on false comp', function (done) {
        let id = todos[1]._id.toString();
        let newTodo = {
            text: 'test',
            completed: false
        };

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(newTodo)
            .expect(200)
            .expect(function (res) {
                expect(res.body.todo.text).toBe(newTodo.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeNull();
            })
            .end(done);
    });
});

describe('GET /users/me', function () {
    it('should return user if authenticated', function (done) {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', function (done) {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', function () {
    it('should create a user', function (done) {
        let email = 'test@test.huy';
        let password = 'testpass';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeDefined();
                expect(res.body._id).toBeDefined();
                expect(res.body.email).toBe(email);
            })
            .end(function (err) {
                if (err)
                    return done(err);

                User.findOne({email}).then(function (user) {
                    expect(user).toBeDefined();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', function (done) {
        let email = 'acc1mail.ua';
        let password = 'pass';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', function (done) {
        let email = users[0].email;
        let password = 'testpass';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', function () {
    it('should login user and return auth token', function (done) {
        let email = users[1].email;
        let password = users[1].password;

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeDefined();
            })
            .end(function (err, res) {
                if (err)
                    return done(err);

                User.findById(users[1]._id).then(function (user) {
                    expect(user.tokens[1]).toHaveProperty('access', 'auth');
                    expect(user.tokens[1]).toHaveProperty('token', res.headers['x-auth']);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', function (done) {
        let email = users[1].email;
        let password = users[0].password;

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeDefined();
            })
            .end(function (err, res) {
                if (err)
                    return done(err);

                User.findById(users[1]._id).then(function (user) {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('DELETE /users/me/token', function () {
    it('should remove auth token on logout', function (done) {
        request(app)
            .delete(`/users/me/token`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);

                User.findById(users[0]._id).then(function (user) {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});