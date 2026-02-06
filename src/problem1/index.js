// A) loop
var sum_to_n_a = function (n) {
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};

// B) formula
var sum_to_n_b = function (n) {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

// C) reduce
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
};

console.log(sum_to_n_a(5), sum_to_n_b(5), sum_to_n_c(5)); // 15 15 15
