import {fetchComments} from "$lib/api/commentApi.svelte";
import type {Comment,PaginationMeta} from "$lib/types/comment";

export function createComments(
    getPage: () => number,
    getQ?: () => string | undefined,
    getColumns: () => string[] = () => []
){
    let data = $state<Comment[]>([]);
    let meta: PaginationMeta | null = $state(null);
    let loading = $state(false);


    $effect(() => {
        const load = async () => {
            const columnsKey = getColumns().join(",");

            loading = true;
            try {
                const cols = columnsKey ? columnsKey.split(",") : [];
                const result = await fetchComments(
                    getPage(), 
                    getQ?.(), 
                    cols);
                data = result.data;
                meta = result.meta;
            } finally {
                loading = false;
            }   
        };
        load();
    })

    return {
        get data(): Comment[] { return data; },
        get meta(): PaginationMeta | null { return meta; },
        get loading(): boolean { return loading; }
    };

}