# Run cypress locally

You can use `./scripts/test.sh` to run tests locally. Run it to get usage help. You can either let the script run cypress tests by itself, or just use it to quickly prepare your local env with test-specific env/fixtures and do manual tests.

The script will error out if it doesn’t find the necessary env vars. Ask a teammate for specific env vars and put the values in your `.env`.

:information_source: By default, the script runs the test node server on port 3002. This is done so that you can keep your default local dev instance up while running the tests.
