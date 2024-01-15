import showdown from "showdown";

export function markdownToHtml(markdown) {
    if (markdown) {
        showdown.setFlavor("github");
        const regex = /(\n\d+\. .+|\n- .+)(\n[^\n])/g;
        const updatedMarkdown = markdown.replace(regex, "$1\n$2");
        var converter = new showdown.Converter();
        const html = converter.makeHtml(updatedMarkdown);
        // remove id from all h tags
        const noId = html.replace(/id=".*?"/g, "");
        // remove line breaks from all h tags
        const noLineBreak = noId.replace(/\n/g, "");
        return noLineBreak;
    }
}
