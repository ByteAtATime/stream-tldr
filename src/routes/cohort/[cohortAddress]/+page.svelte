<script lang="ts">
    import Markdown from "svelte-exmarkdown";
    import { shortenAddress } from "$lib/utils";

    export let data;

    let summary: string | null = null;
    let error: string | null = null;

    const { cohortAddress, summaryPromise, builderEnsPromise } = data;

    async function fetchSummary() {
        try {
            summary = await summaryPromise;
            const promises = await builderEnsPromise;

            for (const promise of promises) {
                try {
                    const [address, ensName] = await promise;
                    if (ensName && summary) {
                        summary = summary.replaceAll(address, ensName);
                    }
                } catch {
                    // Ignore
                }
            }
        } catch (e) {
            error = e.message;
        }
    }

    fetchSummary();
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
            <Markdown md={summary} />
        </div>
    {/if}
</div>