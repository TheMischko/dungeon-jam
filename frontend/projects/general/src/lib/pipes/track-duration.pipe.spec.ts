import { TrackDurationPipe } from './track-duration.pipe';

describe('TrackDurationPipe', () => {
  const pipe = new TrackDurationPipe();

  it('should transform value 60 to string 01:00', () => {
    expect(pipe.transform(60)).toEqual('01:00');
  });

  it('should transform value 1 to string 00:01', () => {
    expect(pipe.transform(1)).toEqual('00:01');
  });

  it('should transform value 61 to string 01:01', () => {
    expect(pipe.transform(61)).toEqual('01:01');
  });

  it('should transform value 86 to string 01:26', () => {
    expect(pipe.transform(86)).toEqual('01:26');
  });

  it('should transform negative number to string --:--', () => {
    expect(pipe.transform(-1)).toEqual('--:--');
  });

  it('should transform zero to string --:--', () => {
    expect(pipe.transform(0)).toEqual('--:--');
  });

  it('should round decimal numbers to closest seconds', () => {
    expect(pipe.transform(0.4)).toEqual('00:00');
    expect(pipe.transform(0.5)).toEqual('00:01');
  });
});
