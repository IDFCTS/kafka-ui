import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clusterACLPath } from 'lib/paths';
import CustomACLForm from 'components/ACLPage/Form/CustomACL/Form';
import { useCreateCustomAcl } from 'lib/hooks/api/acl';

jest.mock('lib/hooks/api/acl', () => ({
  useCreateCustomAcl: jest.fn(),
}));

describe('CustomACLForm', () => {
  const clusterName = 'local';

  beforeEach(() => {
    (useCreateCustomAcl as jest.Mock).mockImplementation(() => ({
      createResource: jest.fn(),
    }));
  });

  const renderComponent = () =>
    render(
      <WithRoute path={clusterACLPath()}>
        <CustomACLForm formRef={null} />
      </WithRoute>,
      { initialEntries: [clusterACLPath(clusterName)] }
    );

  // The form renders two Select dropdowns: resource type (first) and operation
  // (second).
  const getResourceTypeSelect = () => screen.getAllByRole('listbox')[0];
  const getOperationSelect = () => screen.getAllByRole('listbox')[1];

  it('does not offer DELETE for a TOPIC with the EXACT pattern (default)', async () => {
    renderComponent();
    await userEvent.click(getOperationSelect());
    expect(
      within(getOperationSelect()).queryByText('DELETE')
    ).not.toBeInTheDocument();
  });

  it('offers DELETE for a TOPIC when the PREFIXED pattern is selected', async () => {
    renderComponent();
    await userEvent.click(screen.getByText('PREFIXED'));
    await userEvent.click(getOperationSelect());
    expect(
      within(getOperationSelect()).getByText('DELETE')
    ).toBeInTheDocument();
  });

  it('resets the operation when switching the pattern from PREFIXED back to EXACT', async () => {
    renderComponent();
    await userEvent.click(screen.getByText('PREFIXED'));
    await userEvent.click(getOperationSelect());
    await userEvent.selectOptions(getOperationSelect(), ['DELETE']);
    expect(
      within(getOperationSelect()).getByText('DELETE')
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('EXACT'));
    expect(
      within(getOperationSelect()).queryByText('DELETE')
    ).not.toBeInTheDocument();
  });

  it('does not offer DELETE for a non-TOPIC resource even with PREFIXED', async () => {
    renderComponent();
    await userEvent.click(getResourceTypeSelect());
    await userEvent.selectOptions(getResourceTypeSelect(), ['GROUP']);
    await userEvent.click(screen.getByText('PREFIXED'));
    await userEvent.click(getOperationSelect());
    expect(
      within(getOperationSelect()).queryByText('DELETE')
    ).not.toBeInTheDocument();
  });
});
