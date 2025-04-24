import * as chai from "chai";
import {default as chaiHttp, request} from "chai-http";
import { app } from '../server.js';
import  User from '../models/user.model.js'
import Message from '../models/message.model.js';
import Conversation from "../models/conversation.model.js";
import Community from '../models/community.model.js';
chai.use(chaiHttp); 

const { expect } = chai;  

describe('Auth Endpoints', () => {
  it('should register a user (signup)', (done) => {
    request.execute(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Test1234!',
        confirmpassword: 'Test1234!',
        gender: 'male',
      })
      .end(async (err, res) => {
        try {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
      
          const result = await User.deleteOne({ username: 'testuser' });
          console.log('Usuarios eliminados:', result.deletedCount); 
      
          done();
        } catch (e) {
          done(e);
        }
      });
  });
  it('should register a user 2 (signup)', (done) => {
    request.execute(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'Test1234!',
        confirmpassword: 'Test1234!',
        gender: 'male',
      })
      .end(async (err, res) => {
        try {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
      
          const result = await User.deleteOne({ username: 'testuser2' });
          console.log('Usuarios eliminados:', result.deletedCount); 
      
          done();
        } catch (e) {
          done(e);
        }
      });
  });
  
  it('should fail to register user with short password', (done) => {
    request.execute(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser5',
        email: 'test5@example.com',
        password: '123',
        confirmpassword: '123',
        gender: 'male',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return JWT cookie on successful login', (done) => {
    request.execute(app)
      .post('/api/auth/login')
      .send({ username: 'usuario105', password: '123456' })
      .end((err, res) => {
        const cookie = res.headers['set-cookie'];
        expect(cookie).to.be.an('array');
        expect(cookie[0]).to.include('jwt=');
        done();
      });
  });

  it('should fail facial signup with missing face descriptor', (done) => {
    request.execute(app)
      .post('/api/auth/signupFacial')
      .send({
        username: 'faceless',
        password: 'Test1234!',
        gender: 'male',
        email: 'face@example.com',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return 404 if login route is incorrect', (done) => {
    request.execute(app)
      .post('/api/auth/loginn')
      .send({ username: 'usuario105', password: '123456' })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });



  it('should fail to register a user with mismatched passwords', (done) => {
    request.execute(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'Test1234!',
        confirmpassword: 'Test5678!',
        gender: 'female',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error').eql('Passwords do not match');
        done();
      });
  });

  it('should login a user (login)', (done) => {
    request.execute(app)
      .post('/api/auth/login')
      .send({
        username: 'usuario105',
        password: '123456',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('User logged in successfully');
  
        const cookies = res.headers['set-cookie'];
        expect(cookies).to.be.an('array');
  
        const hasJwtCookie = cookies.some(cookie => cookie.startsWith('jwt='));
        expect(hasJwtCookie).to.be.true;
  
        done();
      });
  });
  

  it('should fail to login with incorrect credentials', (done) => {
    request.execute(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'WrongPassword!',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error').eql('Invalid credentials');
        done();
      });
  });

  it('should register a user with facial data', (done) => {
    const newUser = {
      username: 'testuser',
      password: 'Test1234!',
      gender: 'male',
      email: 'testuser@example.com',
      faceDescriptor: JSON.stringify([0.1, 0.2, 0.3, 0.4]),  
    };

    request.execute(app)
      .post('/api/auth/signupFacial')
      .send(newUser)
      .end(async (err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message').eql('User registered successfully');
        

        const result = await User.deleteOne({ username: 'testuser' });
        console.log('Usuarios eliminados:', result.deletedCount); 

        done();
      });
  });

  it('should return 400 if faceDescriptor is missing', (done) => {
    const invalidUser = {
      username: 'testuser2',
      password: 'Test1234!',
      gender: 'male',
      email: 'testuser2@example.com',
    };

    request.execute(app)
      .post('/api/auth/signupFacial')
      .send(invalidUser)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message').eql('Face descriptor is required');
        done();
      });
  });

  it('should return 400 if password is missing', (done) => {
    const invalidUser = {
      username: 'testuser3',
      gender: 'male',
      email: 'testuser3@example.com',
      faceDescriptor: JSON.stringify([0.1, 0.2, 0.3, 0.4]),
    };

    request.execute(app)
      .post('/api/auth/signupFacial')
      .send(invalidUser)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message').eql('Password is required');
        done();
      });
  });

  it('should fail to login with facial recognition if face descriptor is invalid', (done) => {
    request.execute(app)
      .post('/api/auth/loginFacial')
      .send({
        faceDescriptor: JSON.stringify([]),
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message').eql('Invalid face descriptor length');
        done();
      });
  });

  it('should logout a user (logout)', (done) => {
    request.execute(app)
      .post('/api/auth/logout')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('User logged out successfully');
        done();
      });
  });
});

let senderToken, receiverToken;
let senderId, receiverId;
let sentMessageId;

describe('Messages Endpoints', () => {
  before(async () => {
    // Login del usuario emisor (usuario existente en la base de datos)
    const senderRes = await request.execute(app)
      .post('/api/auth/login')
      .send({
        username: 'usuario105',
        password: '123456',
      });

    expect(senderRes).to.have.status(200);
    senderToken = senderRes.headers['set-cookie']; 
    senderId = senderRes.body._id;

    const receiverRes = await request.execute(app)
      .post('/api/auth/login')
      .send({
        username: 'usuario106',
        password: '123456',
      });
    expect(receiverRes).to.have.status(200);
    receiverToken = receiverRes.headers['set-cookie'];
    receiverId = receiverRes.body._id;

  });

  it('should send a message from sender to receiver', async () => {
    const res = await request.execute(app)
      .post(`/api/messages/send/${receiverId}`)
      .set('Cookie', senderToken)
      .send({
        message: 'Hola, esto es un mensaje de prueba',
        selectedKeySize: 'ML-KEM-512',
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('_id');
    expect(res.body.message).to.equal('Hola, esto es un mensaje de prueba');

    sentMessageId = res.body._id;
  });

  it('should retrieve messages between sender and receiver', async () => {
    const res = await request.execute(app)
      .get(`/api/messages/${receiverId}?selectedKeySize=ML-KEM-512`)
      .set('Cookie', senderToken);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.be.greaterThan(0);
    expect(res.body[0]).to.have.property('message');
    expect(res.body[0]).to.have.property('verified');
  });

  after(async () => {
    request.execute(app)
      .post('/api/auth/logout')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('User logged out successfully');
      });
    await Message.deleteOne({ _id: sentMessageId });
    await Conversation.deleteMany({ participants: { $all: [senderId, receiverId] } });
  });
});

let authToken;
let testUserId;

describe('User Endpoints', () => {
  before(async () => {
    // Login con usuario ya existente
    const loginRes = await request.execute(app)
      .post('/api/auth/login')
      .send({
        username: 'usuario105',
        password: '123456',
      });

    expect(loginRes).to.have.status(200);
    authToken = loginRes.headers['set-cookie'];
    testUserId = loginRes.body._id;
  });

  it('should return a list of users for sidebar, excluding the logged-in user', async () => {
    const res = await request.execute(app)
      .get('/api/users')
      .set('Cookie', authToken);

    expect(res).to.have.status(200);
    expect(res.body.filteredUser).to.be.an('array');
    expect(res.body.filteredUser.some(u => u._id === testUserId)).to.be.false;
  });

  it('should return profile picture of a specific user', async () => {
    const user = await User.findOne({ username: 'usuario106' });
    expect(user).to.exist;

    const res = await request.execute(app)
      .get(`/api/users/${user._id}/profile-pic`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('profilePic');
  });

  it('should return popup data for a specific user', async () => {
    const user = await User.findOne({ username: 'usuario106' });
    expect(user).to.exist;

    const res = await request.execute(app)
      .get(`/api/users/${user._id}/popup-data`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.keys('email', 'username', 'publicKey');
  });
});

let communityId;

describe('Community Endpoints', () => {
  before(async () => {
    const loginRes = await request.execute(app)
      .post('/api/auth/login')
      .send({
        username: 'usuario105',
        password: '123456',
      });

    expect(loginRes.status).to.equal(200);  // Usar .to.equal() en lugar de .toBe()
    authToken = loginRes.headers['set-cookie'];
    testUserId = loginRes.body._id;
  });

  it('Create a comunnity', async () => {
    const newCommunity = {
      name: 'Test Community',
      description: 'A community for testing',
      image: 'test_image_url'
    };

    const res = await request.execute(app)
      .post('/api/communities')
      .send(newCommunity);

    expect(res.status).to.equal(201);
    expect(res.body.name).to.equal(newCommunity.name);
    communityId = res.body._id;  
  });

  it('Get all communities', async () => {
    const res = await request.execute(app)
      .get('/api/communities')

    expect(res.status).to.equal(200);
    expect(Array.isArray(res.body)).to.equal(true);
  });

  it('Get a communities by a given id', async () => {
    const res = await request.execute(app)
      .get(`/api/communities/${communityId}`)

    expect(res.status).to.equal(200);
    expect(res.body._id).to.equal(communityId);
  });


 
  it('Send a message to a comunnity', async () => {
    const message = 'This is a test message';

    const res = await request.execute(app)
      .post(`/api/communities/${communityId}/messages`)
      .set('Cookie', authToken)
      .send({ message });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal(message);
 
  });

  it('Remove a communitie', async () => {
    const res = await request.execute(app)
      .delete(`/api/communities/${communityId}`)

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Community deleted successfully');
  });

});

describe('Message Deletion Endpoint', () => {

  it('should delete messages for a valid timePeriod', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '7d' })
      .end((err, res) => {
        try {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message')
        
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  it('should return 400 if timePeriod is missing', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Missing time period parameter.');
        done();
      });
  });

  it('should delete messages older than 30 days', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '30d' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('should delete messages older than 1 hour', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '1h' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });

 

  it('should return 200 for supported time unit (like weeks)', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '3w' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return 200 for negative time value', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '-5d' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should delete messages older than 2 minutes', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '2m' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('should delete messages older than 6 months (180d)', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '180d' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('should handle large valid input gracefully (e.g., 365d)', (done) => {
    request.execute(app)
      .post('/api/deleteOldMessages')
      .send({ timePeriod: '365d' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });

});