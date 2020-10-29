const request = require('supertest');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Process action request', () => {
  let sessionId;

  beforeAll(async () => {
    sessionId = await createSession(request, app);
  });

  const checkAction = async (actions, status) => {
    const res = await request(app)
      .post(`/session/${sessionId}/actions`)
      .send({ actions })
    if (res.status !== status) console.log(res.body)
    expect(res.status).toBe(status)
  };

  it('extract action sequence', async () => {
    await checkAction(null, 400)
    await checkAction([null], 400)
    await checkAction([], 200)
  });

  it('process action sequence', async () => {
    // invalid fields
    await checkAction([{ id: null }], 400)
    await checkAction([{ id: 'none', actions: null }], 400)
    await checkAction([{ id: 'none', actions: [null] }], 400)
    await checkAction([{ id: 'none', actions: [], type: null }], 400)

    // valid
    await checkAction([{ id: 'none', actions: [], type: 'none' }], 200)
    await checkAction([{ id: 'key', actions: [], type: 'key' }], 200)
    await checkAction([{ id: 'pointer', actions: [], type: 'pointer' }], 200)

    // unmatched types
    await checkAction([{ id: 'key', actions: [], type: 'none' }], 400)
    await checkAction([{ id: 'pointer', actions: [], type: 'key' }], 400)
    await checkAction([{ id: 'none', actions: [], type: 'pointer' }], 400)

    // pointer types
    const pointerAction = (id, pointerType) => ([{
      id,
      actions: [],
      type: 'pointer',
      parameters: { pointerType }
    }])
    await checkAction(pointerAction('mouse', null), 400)
    await checkAction(pointerAction('mouse', 'mouse'), 200)
    await checkAction(pointerAction('pen', 'pen'), 200)
    await checkAction(pointerAction('touch', 'touch'), 200)

    // unmatched pointer types
    await checkAction(pointerAction('pen', 'mouse'), 400)
    await checkAction(pointerAction('touch', 'pen'), 400)
    await checkAction(pointerAction('mouse', 'touch'), 400)
  });
});
