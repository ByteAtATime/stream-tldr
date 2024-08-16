<script lang="ts">
    import Markdown from "svelte-exmarkdown"
    import { shortenAddress } from "$lib/utils";

    export let data;

    let summary: string|null = null;
    let error: string|null = null;

    const {cohortAddress, summaryPromise, builderEnsPromise} = data;

    summaryPromise
        .then((s: string) => {
            summary = s;

            builderEnsPromise.then((promises) => {
                for (const promise of promises) {
                    promise
                        .then(([address, ensName]) => {
                            if (ensName && summary) {
                                summary = summary.replaceAll(address, ensName)
                            }
                        })
                        .catch(() => {});
                }
            });
        })
        .catch((e: Error) => {
            error = e.message;
        });
</script>

<div class="flex flex-col items-center px-4 py-8 max-w-screen-md mx-auto">
    <h1 class="font-bold text-2xl mb-4">
        {shortenAddress(cohortAddress)}
    </h1>

    {#if !summary}
        <div class="loading loading-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    {:else if error}
        <p style="color: red">{error}</p>
    {:else}
        <div class="prose">
            <Markdown md={summary}/>
        </div>
    {/if}
</div>
