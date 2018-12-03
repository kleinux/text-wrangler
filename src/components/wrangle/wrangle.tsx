import * as React from 'react';
// import * as ReactDOM from 'react-dom';

class State {
    input: string;
    inputCells: string[][] | null;
    code: string;
    action: string;
    actionMethod: (() => void) | null;
    output: string;
    results: any[];
}

class FunctionInterop {
    result: any;
}

class Wrangle extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            action: '',
            actionMethod: null,
            code: '',
            input: '',
            inputCells: null,
            output: '',
            results: []
        }
    }

    onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const state: State = { ...this.state, input: e.target.value, inputCells: this.getInputCells(e.target.value) };
        this.setState(state, this.computeOutput);
    }

    getInputCells = (input: string): string[][] => {
        var lines = input.split('\n');
        var cells = lines.map(line => line.split('\t'));
        return cells;
    }

    onActionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const state: State = { ...this.state, action: e.target.value };
        this.setState(state, this.computeOutput);
    }

    onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const state: State = { ...this.state, code: e.target.value };
        this.setState(state, this.computeOutput);
    }

    didRender = () => {
        var i = 9;
        i += 8;
        i.toFixed();
    }

    computeOutput = () => {
        let results: any[] = [];
        try {
            const win: any = window;
    // return ${bt}${this.state.action}${bt}
         //   const bt = '`';
            const wrappedAction = `
${this.state.code}
functionInterop.result = (function ($key, $1, $2, $3, $4) {
    return (<div key={$key}>${this.state.action}</div>);
})($key, $1, $2, $3, $4)
`;
            const transformOutput = win.Babel.transform(wrappedAction, { presets: ['es2015', 'react'], retainLines: true, compact: false });
            let output = transformOutput.code;
            const invoke = new Function('React', 'functionInterop', '$key', '$1', '$2', '$3', '$4', output)
            if (this.state.inputCells) {
                const functionInterop: FunctionInterop = { result: null };
                for (let i = 0; i < this.state.inputCells.length; i++) {
                    try {
                        const cells = this.state.inputCells[i];
                        invoke(...[React, functionInterop, 'maybe' + i, ...cells]);
                        results.push(functionInterop.result)
                        // var span = document.createElement('span');
                        // ReactDOM.render(functionInterop.result, span, this.didRender);
                        // output += span.innerText + '\n';
                    } catch (error) {
                        output += error + '\n';
                    }
                }
            }
            const state: State = { ...this.state, output, actionMethod: (...args) => invoke(...args), results };
            this.setState(state);
        } catch (error) {
            const state: State = { ...this.state, output: error.message, actionMethod: null, results };
            this.setState(state);
        }
    }

    handleTabs = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode === 9) { // tab was pressed
            const txt = e.currentTarget;
            var val = txt.value;
            const start = txt.selectionStart;
            const end = txt.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            txt.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            txt.selectionStart = txt.selectionEnd = start + 1;

            // prevent the focus lose
            e.stopPropagation();
            e.preventDefault();
        }
    };

    render() {
        return (<div>
            input:
            <textarea
                id="wrangle-input"
                name="wrangle-input"
                rows={4}
                cols={45}
                onKeyDown={this.handleTabs}
                onChange={this.onInputChange}
                value={this.state.input}>
            </textarea>
            code:
            <textarea
                id="wrangle-code"
                name="wrangle-code"
                rows={4}
                cols={45}
                onKeyDown={this.handleTabs}
                onChange={this.onCodeChange}
                value={this.state.code}
            >
            </textarea>
            action:
            <textarea
                id="wrangle-action"
                name="wrangle-action"
                rows={4}
                cols={45}
                onKeyDown={this.handleTabs}
                onChange={this.onActionChange}
                value={this.state.action}
            >
            </textarea>
            output:
            <textarea
                id="wrangle-output"
                name="wrangle-output"
                rows={4}
                cols={45}
                onChange={e => { return; }}
                value={this.state.output}
            >
            </textarea>
            results:
            <textarea
                id="wrangle-results"
                name="wrangle-results"
                rows={4}
                cols={45}
                onChange={e => { return; }}
                value={this.state.results}
            >
            </textarea>

            <pre>{this.state.results}</pre>
        </div>)
    }
}

export default Wrangle;