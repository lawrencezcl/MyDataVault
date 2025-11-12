#![cfg_attr(not(feature = "std"), no_std)]

pub mod data_registry;

pub use data_registry::{DataRegistry, DataEntry, AccessRule, PermissionType};