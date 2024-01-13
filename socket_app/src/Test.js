export default function Test(props) {
    return (
        <dialog open={props.opener}>
            <label>{props.label}
                <input id={props.inputId} type="text" />
            </label>
            <div>
                <button onClick={props.submit}>Save</button>
                <button onClick={props.close}>Close</button>
            </div>
        </dialog>);
}