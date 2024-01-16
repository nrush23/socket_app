
export default function Message(props) {
    const iconStyle = {
        color: "white",
        borderRadius: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", 
        backgroundColor: props.color,
        height: "30px",
        width: "30px"
    };
    switch (props.type) {
        case "user":
            return <p className={props.type}><span className="time">{props.time}</span><span className="message">{props.message}</span></p>
        case "other":
            return (
                <div className={props.type}>
                    <span style={iconStyle}>{props.username.charAt(0).toUpperCase()}</span>
                    <div className="message">
                        <span className="username">{props.username}</span>
                        <p className={props.type}>
                            <span className="message">{props.message}</span>
                            <span className="time">{props.time}</span>
                        </p>
                    </div>
                </div>
            );
        default:
            return <p className={props.type}><span className="message">{props.message}</span><span className="time">{props.time}</span></p>
    }
}