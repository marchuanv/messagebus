import Jasmine from 'jasmine';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('./', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 2400000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();
