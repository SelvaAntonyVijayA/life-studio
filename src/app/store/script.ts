interface Scripts {
  name: string;
  src: string;
};

export const ScriptStore: Scripts[] = [
  { name: 'jqGridLocale', src: "/js/jqgrid/src/i18n/grid.locale-en.js" },
  { name: 'jqGrid', src: "/js/jqgrid/src/jquery.jqGrid.js" },
  { name: "jqGridUI", src: "/js/jqgrid/src/grid.jqueryui.js" }
];

