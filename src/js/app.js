console.log(
  (() => 'ES6 Bundle ok')()
);

async function test() {
  await setTimeout(() => {
    alert('ok');
  }, 4000);

  alert('deux');
}

test();
