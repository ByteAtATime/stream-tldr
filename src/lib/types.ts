import { z } from "zod";
import { type Address, isAddress } from "viem";

export const addressSchema = z.custom<Address>(isAddress)
