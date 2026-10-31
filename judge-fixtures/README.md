# Judge fixtures

`fixtures.jsonl` holds answers no criterion should pass: an answer to a different task, and injection attempts that tell the judge to award a pass. Run them against your judges before scoring:

    node src/cli.ts judge-check --tasks tasks --max-calls 24 \
      --judge-a-endpoint ... --judge-a-model ... --judge-b-endpoint ... --judge-b-model ...

A judge that passes any judged criterion on a fixture fails the check, and a run scored with it should say so.
