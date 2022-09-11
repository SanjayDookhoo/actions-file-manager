import { gql, useQuery } from '@apollo/client';
import { objectToGraphqlArgs } from 'hasura-args';

const FolderName = ({ folderId }) => {
	const queryArguments = {
		id: folderId,
	};
	const query = gql`
		query {
			folderByPk(${objectToGraphqlArgs(queryArguments)}) {
				folderName
			}
		}
	`;

	const { data } = useQuery(query);

	return (
		<div>
			{Number.isInteger(folderId) ? (
				<>{data?.folderByPk?.folderName}</>
			) : (
				folderId
			)}
		</div>
	);
};

export default FolderName;
