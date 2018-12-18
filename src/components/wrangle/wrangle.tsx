import * as React from 'react';
import './wrangle.css';
// import * as ReactDOM from 'react-dom';

class State {
    Data: StateData;
    output: string;
    results: string;
}

class StateData {
    action: string;
    code: string;
    input: string;
    where: string;
}

class FunctionInterop {
    result: string;
}

type whereSignature = (args: any[]) => boolean;


class Wrangle extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        const saved = localStorage.getItem('saved');
        if (saved) {
            this.state = {
                Data: JSON.parse(saved) as StateData,
                output: '',
                results: ''
            };
        } else {
            this.state = {
                Data: {
                    action: "",
                    code: "",
                    input: "",
                    where: ""
                },
                output: "",
                results: "",
            }
        }
    }

    setStateData = (data: StateData) => {
        this.setState({ ...this.state, Data: data }, this.computeOutput);
    }

    onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const state: StateData = { ...this.state.Data, input: e.target.value, };
        this.setStateData(state);
    }

    getInputCells = (input: string): string[][] => {
        var lines = input.split('\n');
        var cells = lines.map(line => line.split('\t'));
        return cells;
    }

    onActionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const state: StateData = { ...this.state.Data, action: e.target.value };
        this.setStateData(state);
    }

    onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const state: StateData = { ...this.state.Data, code: e.target.value };
        this.setStateData(state);
    }

    onWhereChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state: StateData = { ...this.state.Data, where: e.target.value };
        this.setStateData(state);
    }

    getWhere = (expression: string, invokeAargs: string[]): whereSignature => {
        if (expression) {
            const escaped = expression.replace(/#(\d+)/g, "$$$1")
            const code = `return (${escaped});`;
            const impl = new Function(...[...invokeAargs, code]);
            return (args) => {
                try {
                    const where = impl(...args);
                    return where;
                } catch {
                    return true;
                }
            }
        } else {
            return () => true;
        }
    }

    computeOutput = () => {
        let results = '';
        try {
            const win: any = window;
            const backTick = '`';
            const replacedHashes = this.state.Data.action
                .replace(/#(\d+)/gm, "$${$$$1}")
                .replace(backTick, "${backTick}");
            const inputCells = this.getInputCells(this.state.Data.input)
            const maxCells: number = inputCells.reduce((prev, current) => Math.max(prev, current.length), 0);
            const wrappedAction = `
${this.state.Data.code}
functionInterop.result = ${backTick}${replacedHashes}${backTick};
`;
            const transformOutput = win.Babel.transform(wrappedAction, { presets: ['es2015'], retainLines: true, compact: false });
            let output = transformOutput.code as string;
            if (inputCells) {
                const invokeArgs: string[] = ['functionInterop', '$index', 'backTick', 'lines'];
                const whereArgs: string[] = [];
                for (let index = 0; index < maxCells; index++) {
                    invokeArgs.push('$' + index);
                    whereArgs.push('$' + index);
                }
                const invoke = new Function(...[...invokeArgs, output]);
                const functionInterop: FunctionInterop = { result: '' };
                const where = this.getWhere(this.state.Data.where, invokeArgs);
                for (let index = 0; index < inputCells.length; index++) {
                    try {
                        const cells = inputCells[index];
                        const args = [functionInterop, index, backTick, inputCells, ...cells];
                        if (where(args)) {
                            invoke(...args);
                            results += functionInterop.result;
                        }
                        // var span = document.createElement('span');
                        // ReactDOM.render(functionInterop.result, span, this.didRender);
                        // output += span.innerText + '\n';
                    } catch (error) {
                        output += error + '\n';
                    }
                }
            }
            const state: State = { ...this.state, output, results };
            this.setState(state);
            localStorage.setItem('saved', JSON.stringify(state.Data));
        } catch (error) {
            const state: State = { ...this.state, output: error.message, results };
            this.setState(state);
            localStorage.setItem('saved', JSON.stringify(state.Data));
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

    getTextAreaRows = (text: string):number => {
        if (!text) {
            return 1;
        }
        let lines = 1;
        for (let i=0; i < text.length; i++) {
            if (text.charAt(i) === "\n") {
                lines++;
            }
        }
        return lines;
    }

    render() {
        return (<div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <label htmlFor="wrangle-input"
                        className="inputLabel">input:</label>
                    <textarea
                        id="wrangle-input"
                        name="wrangle-input"
                        className='fixedInput form-control'
                        rows={this.getTextAreaRows(this.state.Data.input)}
                        onKeyDown={this.handleTabs}
                        onChange={this.onInputChange}
                        value={this.state.Data.input}>
                    </textarea>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <label htmlFor="wrangle-code"
                        className="inputLabel">code:</label>
                    <textarea
                        id="wrangle-code"
                        name="wrangle-code"
                        className='fixedInput form-control'
                        rows={this.getTextAreaRows(this.state.Data.code)}
                        onKeyDown={this.handleTabs}
                        onChange={this.onCodeChange}
                        value={this.state.Data.code}
                        placeholder={`function someName(input) { return "hello " + input }`}>
                    </textarea>
                </div>
            </div>
            <label htmlFor="wrangle-where" className="inputLabel">where:</label>
            <input type='text'
                id="wrangle-where"
                className="form-control"
                value={this.state.Data.where}
                onChange={this.onWhereChange}
            />
            <br />
            <div className="row">
                <div className="col-12">
                    <label htmlFor="wrangle-action" className="inputLabel">action:</label>
                    <textarea
                        id="wrangle-action"
                        name="wrangle-action"
                        className='fixedInput form-control'
                        rows={this.getTextAreaRows(this.state.Data.action)}
                        onKeyDown={this.handleTabs}
                        onChange={this.onActionChange}
                        value={this.state.Data.action}>
                    </textarea>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <label htmlFor="wrangle-results" className="inputLabel"> results:</label>
                    <textarea
                        id="wrangle-results"
                        name="wrangle-results"
                        className="fixedInput form-control"
                        rows={this.getTextAreaRows(this.state.results)}
                        onChange={e => { return; }}
                        value={this.state.results}>
                    </textarea>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <label htmlFor="wrangle-output" className="inputLabel"> output:</label>
                    <textarea
                        id="wrangle-output"
                        name="wrangle-output"
                        className='fixedInput form-control'
                        rows={this.getTextAreaRows(this.state.output)}
                        onChange={e => { return; }}
                        value={this.state.output}
                    >
                    </textarea>
                </div>
            </div>
        </div>)
    }
}

export default Wrangle;