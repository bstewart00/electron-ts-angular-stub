import {appModule} from '../AppModule';

appModule.directive('someDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/SomeDirective.html',
        controller: SomeDirectveController,
        controllerAs: 'ctrl'
    };
})

class SomeDirectveController {
    private _model: string;
    
    constructor() {
        this._model = 'SomeText';
    }
    
    get someText() {
        return this._model;
    }
    
    set someText(value) {
        this._model = value;
    }
    
    get fileContents() {
        return nodeRequire('fs').readFileSync(__dirname + '/../../../static/file.txt')
    }
}