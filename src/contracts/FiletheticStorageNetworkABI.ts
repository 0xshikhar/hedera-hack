/**
 * ABI for FileThetic Storage Network (Provider Registry)
 * Based on ProviderRegistry.sol contract
 */

export const STORAGE_NETWORK_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_fileToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "InsufficientRewardPool",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientStake",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidUptime",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotAuthorizedReporter",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotProviderOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProviderAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProviderIsSlashed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProviderNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProviderNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "JobCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      }
    ],
    "name": "ProviderDeactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      }
    ],
    "name": "ProviderReactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stakedAmount",
        "type": "uint256"
      }
    ],
    "name": "ProviderRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "slashedAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "ProviderSlashed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newTotal",
        "type": "uint256"
      }
    ],
    "name": "ProviderStakeIncreased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "remaining",
        "type": "uint256"
      }
    ],
    "name": "ProviderStakeWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uptime",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reporter",
        "type": "address"
      }
    ],
    "name": "UptimeReported",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "endpoint",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "capabilities",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "stakeAmount",
        "type": "uint256"
      }
    ],
    "name": "registerProvider",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "providerId",
        "type": "uint256"
      }
    ],
    "name": "getProvider",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "providerId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "endpoint",
            "type": "string"
          },
          {
            "internalType": "string[]",
            "name": "capabilities",
            "type": "string[]"
          },
          {
            "internalType": "uint256",
            "name": "stakedAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "uptime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalJobs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "successfulJobs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalRewards",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "registeredAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isSlashed",
            "type": "bool"
          }
        ],
        "internalType": "struct ProviderRegistry.Provider",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minimumStake",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalProviders",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
