import { PostgresQueryRunner } from "typeorm/driver/postgres/PostgresQueryRunner";
import { instrumentFunction } from "./customInstrumentations";

function _patch(klass, path, klassName, logArguments=false) {
    const name = `${klassName}.${path}`;
    const original = klass[path];
    klass[path] = instrumentFunction(original, name, logArguments);
}

function _patchAll() {
    _patch(PostgresQueryRunner.prototype, 'connect', 'PostgresQueryRunner.prototype');
    _patch(PostgresQueryRunner.prototype, 'release', 'PostgresQueryRunner.prototype');
    _patch(PostgresQueryRunner.prototype, 'query', 'PostgresQueryRunner.prototype', true);
    _patch(PostgresQueryRunner.prototype, 'startTransaction', 'PostgresQueryRunner.prototype');
    _patch(PostgresQueryRunner.prototype, 'commitTransaction', 'PostgresQueryRunner.prototype');
    _patch(PostgresQueryRunner.prototype, 'rollbackTransaction', 'PostgresQueryRunner.prototype');
}

_patchAll();