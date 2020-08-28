/**
 * specific to the server call "/api/indexof/" for indexing public folders
 * which is implemented into the dev server, returns a list of files/directories in the given folder.
 * @param subPath
 */
export async function fetchFolderContent(subPath = "") {
    const response = await fetch(`/api/indexof/${subPath}`);
    const body = (await response.json()) as string[] | null;
    if (body === null) {
        throw new Error(`invalid folder name: ${subPath}`);
    }
    return body;
    //.then(data=>data.text().then(data=>{
    //     this.setState({songs: JSON.parse(data)});
    // }));
}
