import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import {App} from '../../src/scripts/main';

chai.use(sinonChai);
const expect = chai.expect;

describe('App', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  it('logs a DEBUG message', () => {
    const stub = sinon.stub();
    app.log(stub, 'hello', true);
    expect(stub).to.have.been.calledWith('DEBUG', 'hello');
  });

  it('logs an INFO message', () => {
    const stub = sinon.stub();
    app.log(stub, 'hello', false);
    expect(stub).to.have.been.calledWith('INFO', 'hello');
  });
});
