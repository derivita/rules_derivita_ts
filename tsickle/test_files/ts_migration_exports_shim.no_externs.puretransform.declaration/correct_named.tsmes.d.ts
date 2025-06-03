/**
 * @fileoverview generator:ts_migration_exports_shim.ts
 */
declare module 'ಠ_ಠ.clutz._dependencies' {
  import 'google3/test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/correct_named';
}
// Generated from test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/correct_named.ts
declare namespace ಠ_ಠ.clutz.module$exports$project$named {
  export import MyRenamedClass = ಠ_ಠ.clutz.module$exports$test_files$ts_migration_exports_shim$no_externs$puretransform$declaration$correct_named.MyNamedClass;
}
// Generated from test_files/ts_migration_exports_shim.no_externs.puretransform.declaration/correct_named.ts
declare module 'goog:project.named' {
  import x = ಠ_ಠ.clutz.module$exports$project$named;
  export = x;
}
