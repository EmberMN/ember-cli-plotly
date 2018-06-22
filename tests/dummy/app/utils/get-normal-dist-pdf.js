export default function getNormalDistPDF(mu, sigma) {
  // See PDF equation here: https://en.wikipedia.org/wiki/Log-normal_distribution
  const k1 = 1 / (Math.sqrt(2*Math.PI*sigma*sigma));
  const k2 = 2 * sigma * sigma;
  return x => k1*Math.exp(-Math.pow(x-mu, 2) / k2);
}
