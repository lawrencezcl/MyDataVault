#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod data_registry {
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    #[derive(Debug, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct DataEntry {
        pub ipfs_hash: Vec<u8>,
        pub data_type: Vec<u8>,
        pub timestamp: u64,
        pub encrypted: bool,
        pub metadata: Vec<u8>,
    }

    #[derive(Debug, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct AccessRule {
        pub grantee: AccountId,
        pub data_id: Vec<u8>,
        pub permission_type: PermissionType,
        pub expiry: Option<u64>,
        pub one_time: bool,
        pub used: bool,
    }

    #[derive(Debug, Clone, Encode, Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum PermissionType {
        Read,
        Write,
        Admin,
    }

    #[ink(storage)]
    pub struct DataRegistry {
        /// Owner of the contract
        owner: AccountId,
        /// Mapping from data ID to data entry
        data_entries: Mapping<Vec<u8>, DataEntry>,
        /// Mapping from user to their data IDs
        user_data: Mapping<AccountId, Vec<Vec<u8>>>,
        /// Mapping from data ID to access rules
        access_rules: Mapping<Vec<u8>, Vec<AccessRule>>,
        /// Counter for data entries
        data_counter: u64,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        Unauthorized,
        DataNotFound,
        AccessDenied,
        InvalidData,
        AlreadyExists,
        RuleNotFound,
    }

    #[ink(event)]
    pub struct DataStored {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        data_id: Vec<u8>,
        ipfs_hash: Vec<u8>,
        data_type: Vec<u8>,
    }

    #[ink(event)]
    pub struct AccessGranted {
        #[ink(topic)]
        data_id: Vec<u8>,
        #[ink(topic)]
        grantee: AccountId,
        permission_type: PermissionType,
    }

    #[ink(event)]
    pub struct AccessRevoked {
        #[ink(topic)]
        data_id: Vec<u8>,
        #[ink(topic)]
        grantee: AccountId,
    }

    impl DataRegistry {
        #[ink(constructor)]
        pub fn new() -> Self {
            let owner = Self::env().caller();
            Self {
                owner,
                data_entries: Mapping::default(),
                user_data: Mapping::default(),
                access_rules: Mapping::default(),
                data_counter: 0,
            }
        }

        #[ink(message)]
        pub fn store_data(
            &mut self,
            data_id: Vec<u8>,
            ipfs_hash: Vec<u8>,
            data_type: Vec<u8>,
            encrypted: bool,
            metadata: Vec<u8>,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            // Check if data ID already exists
            if self.data_entries.contains(&data_id) {
                return Err(Error::AlreadyExists);
            }

            let data_entry = DataEntry {
                ipfs_hash: ipfs_hash.clone(),
                data_type: data_type.clone(),
                timestamp,
                encrypted,
                metadata,
            };

            self.data_entries.insert(data_id.clone(), &data_entry);

            // Add to user's data list
            let mut user_data_list = self.user_data.get(&caller).unwrap_or_default();
            user_data_list.push(data_id.clone());
            self.user_data.insert(caller, &user_data_list);

            self.data_counter += 1;

            self.env().emit_event(DataStored {
                owner: caller,
                data_id: data_id.clone(),
                ipfs_hash,
                data_type,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn get_data(&self, data_id: Vec<u8>) -> Result<DataEntry, Error> {
            self.data_entries.get(&data_id).ok_or(Error::DataNotFound)
        }

        #[ink(message)]
        pub fn get_user_data(&self, user: AccountId) -> Vec<Vec<u8>> {
            self.user_data.get(&user).unwrap_or_default()
        }

        #[ink(message)]
        pub fn grant_access(
            &mut self,
            data_id: Vec<u8>,
            grantee: AccountId,
            permission_type: PermissionType,
            expiry: Option<u64>,
            one_time: bool,
        ) -> Result<(), Error> {
            let caller = self.env().caller();

            // Verify caller owns the data
            let user_data_list = self.user_data.get(&caller).unwrap_or_default();
            if !user_data_list.contains(&data_id) {
                return Err(Error::Unauthorized);
            }

            let mut rules = self.access_rules.get(&data_id).unwrap_or_default();
            
            let rule = AccessRule {
                grantee,
                data_id: data_id.clone(),
                permission_type: permission_type.clone(),
                expiry,
                one_time,
                used: false,
            };

            rules.push(rule);
            self.access_rules.insert(data_id.clone(), &rules);

            self.env().emit_event(AccessGranted {
                data_id,
                grantee,
                permission_type,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn revoke_access(&mut self, data_id: Vec<u8>, grantee: AccountId) -> Result<(), Error> {
            let caller = self.env().caller();

            // Verify caller owns the data
            let user_data_list = self.user_data.get(&caller).unwrap_or_default();
            if !user_data_list.contains(&data_id) {
                return Err(Error::Unauthorized);
            }

            let mut rules = self.access_rules.get(&data_id).unwrap_or_default();
            let original_len = rules.len();
            rules.retain(|rule| rule.grantee != grantee);
            
            if rules.len() == original_len {
                return Err(Error::RuleNotFound);
            }

            self.access_rules.insert(data_id.clone(), &rules);

            self.env().emit_event(AccessRevoked {
                data_id,
                grantee,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn check_access(
            &self,
            data_id: Vec<u8>,
            grantee: AccountId,
            permission_type: PermissionType,
        ) -> bool {
            let rules = self.access_rules.get(&data_id).unwrap_or_default();
            let current_time = self.env().block_timestamp();

            for rule in rules {
                if rule.grantee == grantee && rule.permission_type == permission_type {
                    // Check if rule has expired
                    if let Some(expiry) = rule.expiry {
                        if current_time > expiry {
                            continue;
                        }
                    }

                    // Check if one-time rule has been used
                    if rule.one_time && rule.used {
                        continue;
                    }

                    return true;
                }
            }

            false
        }

        #[ink(message)]
        pub fn use_one_time_access(&mut self, data_id: Vec<u8>, grantee: AccountId) -> Result<(), Error> {
            let mut rules = self.access_rules.get(&data_id).unwrap_or_default();
            
            for rule in rules.iter_mut() {
                if rule.grantee == grantee && rule.one_time && !rule.used {
                    rule.used = true;
                    self.access_rules.insert(data_id, &rules);
                    return Ok(());
                }
            }

            Err(Error::RuleNotFound)
        }

        #[ink(message)]
        pub fn get_data_stats(&self) -> (u64, u64) {
            (self.data_counter, self.env().block_timestamp())
        }

        #[ink(message)]
        pub fn get_contract_owner(&self) -> AccountId {
            self.owner
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_store_and_retrieve_data() {
            let mut contract = DataRegistry::new();
            let data_id = vec![1, 2, 3];
            let ipfs_hash = vec![4, 5, 6];
            let data_type = vec![7, 8, 9];
            let metadata = vec![10, 11, 12];

            // Store data
            assert!(contract.store_data(
                data_id.clone(),
                ipfs_hash.clone(),
                data_type.clone(),
                true,
                metadata.clone(),
            ).is_ok());

            // Retrieve data
            let entry = contract.get_data(data_id.clone()).unwrap();
            assert_eq!(entry.ipfs_hash, ipfs_hash);
            assert_eq!(entry.data_type, data_type);
            assert_eq!(entry.encrypted, true);
            assert_eq!(entry.metadata, metadata);
        }

        #[ink::test]
        fn test_access_control() {
            let mut contract = DataRegistry::new();
            let data_id = vec![1, 2, 3];
            let ipfs_hash = vec![4, 5, 6];
            let data_type = vec![7, 8, 9];
            let metadata = vec![10, 11, 12];

            // Store data
            contract.store_data(
                data_id.clone(),
                ipfs_hash.clone(),
                data_type.clone(),
                true,
                metadata.clone(),
            ).unwrap();

            // Grant access
            let grantee = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().bob;
            assert!(contract.grant_access(
                data_id.clone(),
                grantee,
                PermissionType::Read,
                None,
                false,
            ).is_ok());

            // Check access
            assert!(contract.check_access(
                data_id.clone(),
                grantee,
                PermissionType::Read,
            ));

            // Revoke access
            assert!(contract.revoke_access(data_id.clone(), grantee).is_ok());
            assert!(!contract.check_access(
                data_id.clone(),
                grantee,
                PermissionType::Read,
            ));
        }
    }
}