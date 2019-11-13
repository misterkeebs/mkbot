// const expect = require('chai').expect;

// const wishlist = require('../commands/list');

// describe('wishlist command', () => {
//   let replies;
//   const client = {};
//   const msg = {
//     author: {
//       id: 'AUTHOR_ID',
//     },
//     reply: (...args) => replies.push(args),
//   };

//   beforeEach(() => {
//     replies = [];
//   });

//   describe('when invalid command', () => {
//     beforeEach(() => {
//       wishlist(client, msg, 'abcdef');
//     });

//     it('replies with error', () => {
//       const reply = replies[0];
//       expect(reply[0]).to.match(/^Error: invalid wishlist command/);
//     });
//   });

//   describe('with no command is given', () => {
//     describe('when user has no wishlist', () => {
//       beforeEach(async () => {
//         client.query = () => Promise.resolve({ rows: [] });
//         await wishlist(client, msg, null);
//       });

//       it('tells user that he has no wishlist', () => {
//         const reply = replies[0];
//         expect(reply[0]).to.match(/^You don't currently have a wishlist/);
//       });
//     });
//   });

//   describe('adding to wishlist', () => {
//     const client = {};
//     let sql, data;
//     let rows;

//     beforeEach(() => {
//       client.query = (_sql, _data) => {
//         sql = _sql;
//         data = _data;
//         return Promise.resolve({ rows: [] });
//       };
//     });

//     describe('when user has no wishlist yet', () => {
//       beforeEach(() => {
//         rows = [];
//         return wishlist(client, msg, 'add Synkodrogo');
//       });

//       it('creates the wishlist', () => {
//         console.log('replies', replies);
//       });
//     });
//   });
// });
