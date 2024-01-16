export default function ButtonPopup(props) {
    return (
        <div>
            <button id={props.buttonId} onClick={props.buttonClick}>{props.buttonText}</button>
            <dialog open={props.opener}>
                <div className="dialog">
                    <label>{props.label}</label>
                    <input id={props.inputId} type="text" />
                    <div>
                        <button onClick={props.submit}>Save</button>
                        <button onClick={props.close}>Cancel</button>
                    </div>
                </div>
            </dialog>
        </div>);
}