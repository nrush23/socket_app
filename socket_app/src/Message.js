
export default function Message(props) {
    console.log(props);
    const iconStyle = {
        color: "white",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", 
        backgroundColor: props.color,
        height: "2em",
        width: "2em"
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
        // return <span style={iconStyle}>{props.username.charAt(0)}<div className={props.type}><span className="circle_icon">{props.username}</span><p className={props.type}><span className="message">{props.message}</span><span className="time">{props.time}</span></p></div></span>
        default:
            return <p className={props.type}><span className="message">{props.message}</span><span className="time">{props.time}</span></p>
    }
}