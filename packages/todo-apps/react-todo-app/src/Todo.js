export default function Todo({text, children}) {
    return (
    <div className="py-2 text-2xl clear-both">
        <span>{text}</span>
        <span style={{"float":"right"}}>{children}</span>
    </div>
    )
}