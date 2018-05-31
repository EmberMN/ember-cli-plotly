export default function generateDataSets(n, r) {
  if (typeof n !== 'number') {
    n = 101;
  }
  if (typeof r !== 'number') {
    r = 5;
  }
  const x = new Array(n).fill(0).map((z,i) => r*(2*i/(n-1) - 1)); // [-r, ..., r]
  return [
    {
      name: 'y = -5',
      x,
      y: x.map(() => -5)
    }, {
    name: 'y = 2x-1',
    x,
    y: x.map(x => 2 * x - 1)
  }, {
    name: 'y = 1.5x',
    x,
    y: x.map(x => 1.5 * x)
  }, {
    name: 'y = -1.8x + noise',
    x,
    y: x.map(x => -1.8 * x + 2 * (1 - Math.random()))
  }, {
    name: 'y = 1/x',
    x,
    y: x.map(x => 1 / x),
  }, {
    name: 'y = x*sin(2*x)',
    x,
    y: x.map(x => x * Math.sin(2 * x)),
  }
  ];
}
