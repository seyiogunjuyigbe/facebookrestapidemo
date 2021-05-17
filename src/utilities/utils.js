const m = require('moment');

exports.findSum = function findSum(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum;
};

exports.parseTimeString = function parseTimeString(str) {
  try {
    str = str.toLowerCase();
    str = str.replace(':', '.');
    str = str.replace(':', '');
    str = str.replace(/ /g, '');
    if (str.includes('pm') || str.includes('am')) {
      if (str.includes('pm')) {
        str = str.replace(/pm/g, '');
        if (str.startsWith('12')) {
          str = str.replace('12', '00');
        }
        return String((Number(str) + 12.0).toFixed(2));
      }
      if (str.includes('am')) {
        str = str.replace(/am/g, '');
        if (str.startsWith('12')) {
          str = str.replace('12', '00');
        }
        return str;
      }
    }
    return str;
  } catch (err) {
    console.log({ err });
    return '';
  }
};

exports.formatDate = function formatDate(str) {
  return m.utc(str.replace(/\//g, '-')).format('YYYY-MM-DD');
};

exports.createReference = type => {
  const randomChars = Math.random().toString(32).substr(8);
  let prefix = 'LGN_';
  switch (type) {
    case 'payment':
      prefix += 'PAY';
      break;
    case 'subscription':
      prefix += 'SUB';
      break;
    case 'template':
      prefix += 'TMP';
      break;
    case 'refund':
      prefix += 'RFD';
      break;
    default:
      prefix = 'DEF';
      break;
  }
  return `${prefix}_${randomChars}_${Date.now()}`.toUpperCase();
};

exports.replaceAllOccurences = function replaceAllOccurences(
  str = '',
  obj = {}
) {
  if (str && str.length && Object.keys(obj).length) {
    // eslint-disable-next-line
    for (var x in obj) {
      str = str.replace(new RegExp(x, 'g'), obj[x]);
    }
  }
  return str;
};
