import figlet from "figlet";
export async function welcomeMessage(state) {
    console.log(
        state.f.green(
            figlet.textSync("TinySync", {
                font: "Rectangles",
                horizontalLayout: "default",
                verticalLayout: "default",
                width: 80,
                whitespaceBreak: true,
            })
        )
    );

    console.log(state.f.dim("\n        made with ❤️ by Brian\n"));
}
