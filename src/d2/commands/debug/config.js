const run = ({ _, $0, raw, ...argv }) => {
  const out = JSON.stringify(argv, undefined, raw ? undefined : 2);
  console.log(out);
}

module.exports = {
  command: "config",
  desc: "Inspect configuration",
  builder: {
    "raw": {
      desc: "Don't print whitespace or line breaks.",
      type: "boolean",
    }
  },
  handler: run
};