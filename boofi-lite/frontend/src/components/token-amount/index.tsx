import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputMoney } from "@/components/ui/input";
import { TokenChip } from "@/components/Token/Chip";
import type { Token } from "@/lib/types";
import { getChainConfig } from "@/constants/chain-config";

interface TokenAmountInputProps {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    selectedToken?: Token;
    availableTokens: Token[];
    onTokenSelect: (token: Token) => void;
    currentNetwork: number;
}

export const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
    value,
    onChange,
    selectedToken,
    availableTokens,
    onTokenSelect,
    currentNetwork,
}) => {
    const chainConfig = getChainConfig(currentNetwork);

    const handleTokenChange = (value: string) => {
        const token = availableTokens.find((t: Token) => t.name === value);
        if (token) onTokenSelect(token);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="relative text-center text-4xl">
                <InputMoney
                    placeholder="0.0000"
                    value={value}
                    onChange={onChange}
                    className="text-center w-full"
                />
            </div>

            <Select onValueChange={handleTokenChange}>
                <SelectTrigger className="w-full border-transparent flex justify-between">
                    <SelectValue>
                        {selectedToken && chainConfig && (
                            <div className="flex items-center">
                                <img
                                    src={chainConfig.iconUrls[0]}
                                    alt={chainConfig.name}
                                    className="inline-block w-4 h-4 mr-2"
                                />
                                {selectedToken.name}
                            </div>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full justify-between">
                    <SelectGroup className="justify-stretch gap-2">
                        {availableTokens.map((token: Token) => (
                            <SelectItem
                                key={token.address}
                                value={token.name}
                                className="flex flex-row items-center justify-center w-full"
                            >
                                <TokenChip
                                    token={token}
                                    className="w-full bg-white hover:bg-white m-auto"
                                />
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};