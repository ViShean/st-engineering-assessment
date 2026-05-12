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
        // Read all reactive getters synchronously so Svelte tracks them as dependencies
        const currentPage = getPage();
        const currentQ = getQ?.();
        const currentCols = getColumns();

        const load = async () => {
            loading = true;
            try {
                const result = await fetchComments(currentPage, currentQ, currentCols);
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