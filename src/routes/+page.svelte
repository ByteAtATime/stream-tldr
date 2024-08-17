<script lang="ts">
    import { COHORTS } from "$lib/cohort";
    import { BUILDERS } from "$lib/builder";
    import { ChevronRight, Icon } from "svelte-hero-icons";
    import { isAddress } from "viem";
    import { goto } from "$app/navigation";

    let cohortAddress = '';
    let builderAddress = '';

    $: cohortError = cohortAddress && !isAddress(cohortAddress);
    $: builderError = builderAddress && !isAddress(builderAddress);
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 max-w-screen-lg mx-auto gap-x-8 gap-y-16 p-8">
    <div class="flex flex-col gap-y-4">
        <h2 class="text-3xl font-bold">Cohorts</h2>

        <div class="flex flex-col gap-y-2">
            <form class="join" on:submit|preventDefault={() => goto(`cohort/${cohortAddress}`)}>
                <input type="text" placeholder="Enter a cohort's address..." class="input input-bordered w-full join-item" bind:value={cohortAddress} class:input-error={cohortError} />
                <button type="submit" class="btn btn-primary btn-square join-item" disabled={!!cohortError}>
                    <Icon src={ChevronRight} class="h-6 w-6" />
                </button>
            </form>

            {#each COHORTS as { name, address } (address)}
                <a href="/cohort/{address}" class="flex flex-col gap-y-1">
                    <div class="btn btn-secondary btn-outline justify-start">
                        <h3 class="text-2xl font-bold">{name}</h3>
                    </div>
                </a>
            {/each}
        </div>
    </div>

    <div class="flex flex-col gap-y-4">
        <h2 class="text-3xl font-bold">Buidlers</h2>

        <div class="flex flex-col gap-y-2">
            <form class="join" on:submit|preventDefault={() => goto(`builder/${builderAddress}`)}>
                <input type="text" placeholder="Enter a builder's address..." class="input input-bordered w-full join-item" bind:value={builderAddress} class:input-error={builderError} />
                <button type="submit" class="btn btn-primary btn-square join-item" disabled={!!builderError}>
                    <Icon src={ChevronRight} class="h-6 w-6" />
                </button>
            </form>

            {#each BUILDERS as { name, address } (address)}
                <a href="/builder/{address}" class="flex flex-col gap-y-1">
                    <div class="btn btn-secondary btn-outline justify-start">
                        <h3 class="text-2xl font-bold">{name}</h3>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>
